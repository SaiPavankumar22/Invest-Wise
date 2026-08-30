"""
Credit Score Improvement Agent — Analyzes credit factors, identifies
what's hurting the score, and provides an improvement plan.

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

CREDIT_SCORE_SYSTEM_PROMPT = """\
You are a credit score improvement expert for the Indian market (CIBIL score).
Given the user's credit profile, return a JSON object (and nothing else) with:

{
  "current_score_analysis": {
    "estimated_score_range": "<range like 650-700>",
    "rating": "poor" | "fair" | "good" | "very_good" | "excellent",
    "score_factors": [
      { "factor": "<name>", "impact": "positive" | "negative" | "neutral", "weight": "<%>", "detail": "<text>" }
    ]
  },
  "factor_breakdown": {
    "payment_history": { "score": <1-10>, "impact": "<text>", "advice": "<text>" },
    "credit_utilization": { "score": <1-10>, "current_usage": "<%>", "ideal_usage": "<%>", "advice": "<text>" },
    "credit_age": { "score": <1-10>, "avg_age_years": <number>, "advice": "<text>" },
    "credit_mix": { "score": <1-10>, "types": ["<type1>"], "advice": "<text>" },
    "new_inquiries": { "score": <1-10>, "count_last_6mo": <number>, "advice": "<text>" }
  },
  "improvement_plan": {
    "immediate_actions": [
      { "action": "<text>", "expected_impact": "+<points> points", "timeline": "<time>" }
    ],
    "short_term": [
      { "action": "<text>", "expected_impact": "+<points> points", "timeline": "<time>" }
    ],
    "long_term": [
      { "action": "<text>", "expected_impact": "+<points> points", "timeline": "<time>" }
    ]
  },
  "projected_timeline": {
    "3_months": <estimated_score>,
    "6_months": <estimated_score>,
    "12_months": <estimated_score>,
    "24_months": <estimated_score>
  },
  "things_to_avoid": [
    "<thing1>", "<thing2>"
  ],
  "products_to_consider": [
    { "type": "<credit_card|loan>", "name": "<product>", "why": "<reason>" }
  ]
}

CIBIL Score Ranges:
- 300-549: Poor
- 550-649: Fair
- 650-749: Good
- 750-799: Very Good
- 800-900: Excellent

Score Factor Weights (CIBIL):
- Payment History: 30%
- Credit Utilization: 25%
- Credit Age: 20%
- Credit Mix: 15%
- New Inquiries: 10%

Rules:
- Be specific about what actions help and by how much.
- Credit utilization below 30% is ideal, below 10% is excellent.
- Each hard inquiry can reduce score by 5-10 points.
- Missing a payment can drop score by 50-100 points.
- Provide realistic timelines — score improvement takes time.
- Products should be suitable for the user's score range.
- Return ONLY the JSON object. No markdown fences, no explanation.
"""

_credit_agent = None


def _get_credit_agent() -> Agent:
    global _credit_agent
    if _credit_agent is None:
        _credit_agent = Agent(
            name="Credit Score Advisor",
            model=get_agno_model(),
            instructions=[
                "You are an expert CIBIL credit score advisor.",
                "Always return valid JSON only.",
                "Provide realistic improvement timelines.",
                "Focus on actionable steps with measurable impact.",
            ],
            markdown=False,
        )
    return _credit_agent


def _fallback_credit(data: dict[str, Any]) -> dict[str, Any]:
    """Rule-based credit score analysis — works without API key."""
    score = int(data.get("current_score", 650))
    cards = int(data.get("credit_cards", 2))
    limit = float(data.get("total_credit_limit", 300000))
    util = float(data.get("current_utilization", 40))
    age_yrs = int(data.get("oldest_account_years", 3))
    inquiries = int(data.get("recent_inquiries", 1))
    payment = data.get("payment_history", "good")
    missed = int(data.get("missed_payments", 0))

    # Score estimate from factors
    payment_score = 9 if payment == "excellent" else 7 if payment == "good" else 4 if payment == "fair" else 2
    util_score = 10 if util < 10 else 8 if util < 30 else 5 if util < 50 else 3
    age_score = min(10, age_yrs * 1.5)
    inquiry_score = max(1, 10 - inquiries * 2)
    mix_score = 7 if cards >= 2 else 5

    # Weighted score
    raw = (payment_score * 0.30 + util_score * 0.25 + age_score * 0.20 + mix_score * 0.15 + inquiry_score * 0.10) * 10 + 200
    if missed > 0:
        raw -= missed * 30
    estimated = max(300, min(900, int(raw)))

    if estimated < 550: rating = "poor"
    elif estimated < 650: rating = "fair"
    elif estimated < 750: rating = "good"
    elif estimated < 800: rating = "very_good"
    else: rating = "excellent"

    immediate = []
    short_term = []
    long_term = []

    if util > 30:
        immediate.append({"action": "Pay down credit card balances to below 30%% utilization", "expected_impact": "+15-25 points", "timeline": "1-2 months"})
    if missed > 0:
        immediate.append({"action": "Set up auto-pay for all credit cards to avoid future missed payments", "expected_impact": "+20-50 points", "timeline": "3-6 months"})
    if inquiries > 3:
        short_term.append({"action": "Avoid applying for new credit for 6 months", "expected_impact": "+10-20 points", "timeline": "6 months"})
    short_term.append({"action": "Request credit limit increase on existing cards (reduces utilization %)", "expected_impact": "+5-15 points", "timeline": "1-3 months"})
    long_term.append({"action": "Maintain old credit accounts open (improves credit age)", "expected_impact": "+10-20 points", "timeline": "12-24 months"})
    long_term.append({"action": "Build credit mix with a secured credit card or small personal loan", "expected_impact": "+5-10 points", "timeline": "6-12 months"})

    return {
        "current_score_analysis": {"estimated_score_range": "%d-%d" % (estimated - 20, estimated + 20), "rating": rating, "score_factors": [
            {"factor": "Payment History", "impact": "positive" if payment_score >= 7 else "negative", "weight": "30%%", "detail": "Payment history: %s" % payment},
            {"factor": "Credit Utilization", "impact": "negative" if util > 30 else "positive", "weight": "25%%", "detail": "Using %.0f%% of credit limit" % util},
            {"factor": "Credit Age", "impact": "positive" if age_yrs >= 3 else "neutral", "weight": "20%%", "detail": "Oldest account: %d years" % age_yrs},
            {"factor": "Credit Mix", "impact": "neutral", "weight": "15%%", "detail": "%d active cards" % cards},
            {"factor": "New Inquiries", "impact": "negative" if inquiries > 2 else "positive", "weight": "10%%", "detail": "%d inquiries in last 6 months" % inquiries},
        ]},
        "factor_breakdown": {
            "payment_history": {"score": payment_score, "impact": "Good payment record" if payment_score >= 7 else "Missed payments hurt score", "advice": "Always pay at least minimum by due date"},
            "credit_utilization": {"score": util_score, "current_usage": "%.0f%%" % util, "ideal_usage": "below 30%%", "advice": "Keep utilization below 30%% for good score"},
            "credit_age": {"score": int(age_score), "avg_age_years": age_yrs, "advice": "Keep oldest accounts open"},
            "credit_mix": {"score": mix_score, "types": ["credit_card"] * cards, "advice": "Diversify with different credit types"},
            "new_inquiries": {"score": inquiry_score, "count_last_6mo": inquiries, "advice": "Limit new credit applications"},
        },
        "improvement_plan": {"immediate_actions": immediate, "short_term": short_term, "long_term": long_term},
        "projected_timeline": {"3_months": min(900, estimated + 20), "6_months": min(900, estimated + 40), "12_months": min(900, estimated + 70), "24_months": min(900, estimated + 100)},
        "things_to_avoid": ["Missing payment due dates", "Closing old credit accounts", "Applying for multiple credit cards at once", "Maxing out credit limits"],
    }


def analyze_credit_score(data: dict[str, Any]) -> dict[str, Any]:
    """Run the Credit Score Agent. Tries LLM first; falls back to rules."""
    from services.nebius_config import has_valid_api_key
    if not has_valid_api_key():
        logger.info("No API key set, using rule-based fallback for analyze_credit_score")
        return _fallback_credit(data)

    user_input = json.dumps(data, indent=2)
    try:
        agent = _get_credit_agent()
        response = agent.run(user_input)
        content = response.content if hasattr(response, "content") else str(response)
        from services.nebius_config import parse_json_response
        result = parse_json_response(content)
        if "raw_response" not in result:
            return result
    except Exception as e:
        logger.warning("Agno agent failed: %s", e)

    llm_result = call_agent_llm(CREDIT_SCORE_SYSTEM_PROMPT, user_input)
    if llm_result and "raw_response" not in llm_result:
        return llm_result

    logger.info("Using rule-based credit score fallback")
    return _fallback_credit(data)
