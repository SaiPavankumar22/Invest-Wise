"""
Retirement Corpus Calculator Agent — Projects retirement corpus,
performs gap analysis, and recommends SIP top-ups.

Uses Agno for agent orchestration and LangChain prompt templates with
Nebius (Gemma 3 27B IT) as the LLM backend.
"""

import json
import logging
from typing import Any

from agno.agent import Agent

from services.nebius_config import get_agno_model, call_agent_llm

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

RETIREMENT_SYSTEM_PROMPT = """\
You are a retirement planning expert. Given the user's financial data, return a
JSON object (and nothing else) with these keys:

{
  "current_profile": {
    "current_age": <number>,
    "retirement_age": <number>,
    "years_to_retirement": <number>,
    "current_monthly_savings": <number>,
    "expected_return_rate": <number>,
    "inflation_rate": <number>,
    "monthly_expenses": <number>
  },
  "projections": {
    "without_inflation": <number>,
    "with_inflation": <number>,
    "corpus_needed": <number>,
    "current_trajectory": <number>,
    "gap": <number>,
    "gap_percentage": <number>
  },
  "yearly_breakdown": [
    { "age": <number>, "year": <number>, "invested": <number>, "corpus": <number> }
  ],
  "sip_recommendations": {
    "required_monthly_sip": <number>,
    "current_sip": <number>,
    "top_up_needed": <number>,
    "alternative_scenarios": [
      { "monthly_sip": <number>, "expected_corpus": <number>, "label": "<text>" }
    ]
  },
  "tax_saving_tips": [
    { "instrument": "<name>", "annual_benefit": <number>, "expected_return": "<%>" }
  ],
  "recommendations": [
    "<tip1>", "<tip2>", "<tip3>"
  ]
}

Rules:
- Corpus needed = Monthly expenses × 12 × 25 (25x rule) adjusted for inflation.
- Use compound interest: A = P × ((1 + r)^n - 1) / r for SIP projections.
- inflation_rate default to 6% if not provided.
- expected_return_rate: equity 12%, debt 7%, balanced 9%.
- Generate yearly breakdown from current age to retirement age.
- Provide at least 3 alternative scenarios.
- Return ONLY the JSON object. No markdown fences, no explanation.
"""

_retirement_agent = None


def _get_retirement_agent() -> Agent:
    global _retirement_agent
    if _retirement_agent is None:
        _retirement_agent = Agent(
            name="Retirement Calculator",
            model=get_agno_model(),
            instructions=[
                "You are an expert retirement planning advisor.",
                "Always return valid JSON only.",
                "Use accurate compound interest calculations.",
                "Consider inflation when projecting corpus needs.",
            ],
            markdown=False,
        )
    return _retirement_agent


def _fallback_retirement(data: dict[str, Any]) -> dict[str, Any]:
    """Rule-based retirement projection — works without API key."""
    age = int(data.get("current_age", 30))
    ret_age = int(data.get("retirement_age", 60))
    monthly_sip = float(data.get("current_monthly_savings", 15000))
    monthly_exp = float(data.get("monthly_expenses", 40000))
    ret_rate = float(data.get("expected_return_rate", 0.12))
    infl = float(data.get("inflation_rate", 0.06))
    corpus = float(data.get("current_corpus", 0))
    years = max(ret_age - age, 1)
    months = years * 12
    mr = ret_rate / 12

    # SIP future value
    sip_fv = monthly_sip * (((1 + mr) ** months - 1) / mr) if mr > 0 else monthly_sip * months
    total_corpus = corpus * (1 + ret_rate) ** years + sip_fv

    # Inflation-adjusted
    inflated_expenses = monthly_exp * (1 + infl) ** years
    corpus_needed = inflated_expenses * 12 * 25
    gap = max(0, corpus_needed - total_corpus)

    # Yearly breakdown
    yearly = []
    invested = 0
    running_corpus = corpus
    for y in range(years):
        invested += monthly_sip * 12
        running_corpus = running_corpus * (1 + ret_rate) + monthly_sip * (((1 + mr) ** 12 - 1) / mr) if mr > 0 else running_corpus * (1 + ret_rate) + monthly_sip * 12
        yearly.append({"age": age + y + 1, "year": y + 1, "invested": round(invested, 2), "corpus": round(running_corpus, 2)})

    # SIP needed for target
    if gap > 0 and mr > 0:
        required_sip = gap / (((1 + mr) ** months - 1) / mr)
    else:
        required_sip = 0

    scenarios = [
        {"monthly_sip": round(monthly_sip, 2), "expected_corpus": round(total_corpus, 2), "label": "Current SIP"},
        {"monthly_sip": round(monthly_sip * 1.5, 2), "expected_corpus": round(total_corpus * 1.5, 2), "label": "50%% More SIP"},
        {"monthly_sip": round(max(required_sip, monthly_sip * 2), 2), "expected_corpus": round(corpus_needed, 2), "label": "Target Match"},
    ]

    return {
        "current_profile": {"current_age": age, "retirement_age": ret_age, "years_to_retirement": years, "current_monthly_savings": monthly_sip, "expected_return_rate": ret_rate, "inflation_rate": infl, "monthly_expenses": monthly_exp},
        "projections": {"without_inflation": round(total_corpus, 2), "with_inflation": round(corpus_needed, 2), "corpus_needed": round(corpus_needed, 2), "current_trajectory": round(total_corpus, 2), "gap": round(gap, 2), "gap_percentage": round(gap / corpus_needed * 100, 1) if corpus_needed > 0 else 0},
        "yearly_breakdown": yearly,
        "sip_recommendations": {"required_monthly_sip": round(required_sip, 2), "current_sip": monthly_sip, "top_up_needed": round(max(0, required_sip - monthly_sip), 2), "alternative_scenarios": scenarios},
        "recommendations": [
            "Increase SIP by 10%% annually to beat inflation",
            "Diversify: 60%% equity, 30%% debt, 10%% gold",
            "Max out NPS and PPF for tax-saving + guaranteed returns",
        ],
    }


def calculate_retirement(data: dict[str, Any]) -> dict[str, Any]:
    """Run the Retirement Corpus Calculator. Tries LLM first; falls back to calculation."""
    from services.nebius_config import has_valid_api_key
    if not has_valid_api_key():
        logger.info("No API key set, using rule-based fallback for calculate_retirement")
        return _fallback_retirement(data)

    user_input = json.dumps(data, indent=2)
    try:
        agent = _get_retirement_agent()
        response = agent.run(user_input)
        content = response.content if hasattr(response, "content") else str(response)
        from services.nebius_config import parse_json_response
        result = parse_json_response(content)
        if "raw_response" not in result:
            return result
    except Exception as e:
        logger.warning("Agno agent failed: %s", e)

    llm_result = call_agent_llm(RETIREMENT_SYSTEM_PROMPT, user_input)
    if llm_result and "raw_response" not in llm_result:
        return llm_result

    logger.info("Using rule-based retirement calculation fallback")
    return _fallback_retirement(data)
