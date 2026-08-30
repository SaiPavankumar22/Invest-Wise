"""
Insurance Advisor Agent — Recommends optimal life, health, and term
insurance coverage, identifies gaps in existing policies.

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

INSURANCE_SYSTEM_PROMPT = """\
You are an expert insurance advisor for Indian customers. Given the user's
profile, return a JSON object (and nothing else) with these keys:

{
  "profile_summary": {
    "age": <number>,
    "income": <number>,
    "dependants": <number>,
    "existing_coverage": <number>
  },
  "recommended_coverage": {
    "term_life": {
      "recommended_amount": <number>,
      "monthly_premium_estimate": <number>,
      "reasoning": "<text>"
    },
    "health": {
      "recommended_amount": <number>,
      "monthly_premium_estimate": <number>,
      "reasoning": "<text>"
    },
    "critical_illness": {
      "recommended_amount": <number>,
      "monthly_premium_estimate": <number>,
      "reasoning": "<text>"
    },
    "personal_accident": {
      "recommended_amount": <number>,
      "monthly_premium_estimate": <number>,
      "reasoning": "<text>"
    }
  },
  "gap_analysis": {
    "total_recommended": <number>,
    "total_existing": <number>,
    "coverage_gap": <number>,
    "gap_status": "underinsured" | "adequately_insured" | "overinsured",
    "priority_actions": [
      { "action": "<text>", "urgency": "high" | "medium" | "low", "estimated_cost": <number> }
    ]
  },
  "policy_recommendations": [
    {
      "type": "<term|health|vehicle|home>",
      "provider": "<insurer_name>",
      "plan_name": "<plan>",
      "sum_insured": <number>,
      "annual_premium": <number>,
      "key_benefits": ["<benefit1>", "<benefit2>"]
    }
  ],
  "tax_benefits": {
    "section_80c": <number>,
    "section_80d": <number>,
    "total_tax_saved": <number>
  },
  "tips": [
    "<tip1>", "<tip2>", "<tip3>"
  ]
}

Rules:
- Term life cover should be 10-15x annual income.
- Health insurance should be at least ₹5-10 lakhs per person.
- Consider family floater plans for families.
- Premium estimates should be realistic for Indian market.
- Gap analysis must clearly show what's missing.
- Tax benefits: 80C for life insurance premiums (up to 1.5L), 80D for health (up to 25K/50K).
- Return ONLY the JSON object. No markdown fences, no explanation.
"""

_insurance_agent = None


def _get_insurance_agent() -> Agent:
    global _insurance_agent
    if _insurance_agent is None:
        _insurance_agent = Agent(
            name="Insurance Advisor",
            model=get_agno_model(),
            instructions=[
                "You are an expert Indian insurance advisor.",
                "Always return valid JSON only.",
                "Recommend realistic premiums for Indian insurance market.",
                "Focus on adequate coverage, not just cheapest premiums.",
            ],
            markdown=False,
        )
    return _insurance_agent


def _fallback_insurance(data: dict[str, Any]) -> dict[str, Any]:
    """Rule-based insurance recommendation — works without API key."""
    age = int(data.get("age", 30))
    income = float(data.get("annual_income", 1200000))
    dependants = int(data.get("dependants", 1))
    existing = data.get("existing_policies") or []
    existing_total = sum(p.get("sum_insured", 0) for p in existing)

    term_cover = round(income * 12, 2)  # 12x income
    health_cover = max(500000, 100000 * (dependants + 1))
    ci_cover = round(income * 3, 2)
    accident_cover = round(income * 2, 2)

    # Premium estimates (annual, Indian market)
    age_factor = max(1, (age - 25) * 0.05)
    term_premium = round(term_cover * 0.001 * age_factor, 2)
    health_premium = round(health_cover * 0.03 * age_factor, 2)
    ci_premium = round(ci_cover * 0.02 * age_factor, 2)
    accident_premium = round(accident_cover * 0.005, 2)

    gap = max(0, term_cover + health_cover - existing_total)
    status = "underinsured" if gap > 0 else "adequately_insured"

    actions = []
    if existing_total < term_cover:
        actions.append({"action": "Get term life cover of at least 12x annual income", "urgency": "high", "estimated_cost": term_premium})
    if existing_total < health_cover:
        actions.append({"action": "Get family floater health insurance (min 5-10L)", "urgency": "high", "estimated_cost": health_premium})
    if not existing:
        actions.append({"action": "Start with term insurance — cheapest when young", "urgency": "high", "estimated_cost": term_premium})

    return {
        "profile_summary": {"age": age, "income": income, "dependants": dependants, "existing_coverage": existing_total},
        "recommended_coverage": {
            "term_life": {"recommended_amount": term_cover, "monthly_premium_estimate": round(term_premium / 12, 2), "reasoning": "12x annual income for family protection"},
            "health": {"recommended_amount": health_cover, "monthly_premium_estimate": round(health_premium / 12, 2), "reasoning": "Min 5L per person, family floater for %d dependants" % dependants},
            "critical_illness": {"recommended_amount": ci_cover, "monthly_premium_estimate": round(ci_premium / 12, 2), "reasoning": "3x income to cover treatment + recovery"},
            "personal_accident": {"recommended_amount": accident_cover, "monthly_premium_estimate": round(accident_premium / 12, 2), "reasoning": "2x income for accidental death/disability"},
        },
        "gap_analysis": {"total_recommended": round(term_cover + health_cover + ci_cover + accident_cover, 2), "total_existing": existing_total, "coverage_gap": round(gap, 2), "gap_status": status, "priority_actions": actions},
        "tax_benefits": {"section_80c": min(term_premium, 150000), "section_80d": min(health_premium, 25000), "total_tax_saved": round((min(term_premium, 150000) + min(health_premium, 25000)) * 0.312, 2)},
        "tips": ["Buy term insurance early — premiums increase with age", "Don't mix insurance with investment (avoid ULIPs initially)", "Review coverage every 2-3 years as income grows"],
    }


def get_insurance_advice(data: dict[str, Any]) -> dict[str, Any]:
    """Run the Insurance Advisor. Tries LLM first; falls back to rules."""
    from services.nebius_config import has_valid_api_key
    if not has_valid_api_key():
        logger.info("No API key set, using rule-based fallback for get_insurance_advice")
        return _fallback_insurance(data)

    user_input = json.dumps(data, indent=2)
    try:
        agent = _get_insurance_agent()
        response = agent.run(user_input)
        content = response.content if hasattr(response, "content") else str(response)
        from services.nebius_config import parse_json_response
        result = parse_json_response(content)
        if "raw_response" not in result:
            return result
    except Exception as e:
        logger.warning("Agno agent failed: %s", e)

    llm_result = call_agent_llm(INSURANCE_SYSTEM_PROMPT, user_input)
    if llm_result and "raw_response" not in llm_result:
        return llm_result

    logger.info("Using rule-based insurance fallback")
    return _fallback_insurance(data)
