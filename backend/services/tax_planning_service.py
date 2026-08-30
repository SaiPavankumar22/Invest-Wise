"""
Tax Planning Agent — Estimates tax liability, recommends optimal regime
(old vs new), and suggests last-minute deductions.

Uses Agno for agent orchestration and LangChain prompt templates with
Nebius (Gemma 3 27B IT) as the LLM backend.
"""

import json
import logging
from typing import Any

from agno.agent import Agent

from services.nebius_config import get_agno_model, call_agent_llm, NEBIUS_MODEL

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

TAX_SYSTEM_PROMPT = """\
You are an expert Indian tax planning advisor. Given the user's financial data,
return a JSON object (and nothing else) with these keys:

{
  "old_regime": {
    "gross_income": <number>,
    "total_deductions": <number>,
    "taxable_income": <number>,
    "tax_amount": <number>,
    "cess": <number>,
    "total_tax": <number>,
    "slab_breakdown": [
      { "slab": "<range>", "rate": "<%>", "tax": <number> }
    ]
  },
  "new_regime": {
    "gross_income": <number>,
    "standard_deduction": 75000,
    "taxable_income": <number>,
    "tax_amount": <number>,
    "cess": <number>,
    "total_tax": <number>,
    "slab_breakdown": [
      { "slab": "<range>", "rate": "<%>", "tax": <number> }
    ]
  },
  "recommended_regime": "old" or "new",
  "savings": <number>,
  "deduction_suggestions": [
    { "section": "<section>", "description": "<text>", "max_benefit": <number>, "priority": "high" or "medium" or "low" }
  ],
  "last_minute_tips": [
    "<tip1>", "<tip2>"
  ]
}

Indian Tax Rules (FY 2024-25):

NEW REGIME (default):
- 0 - 3,00,000: 0%
- 3,00,001 - 7,00,000: 5%
- 7,00,001 - 10,00,000: 10%
- 10,00,001 - 12,00,000: 15%
- 12,00,001 - 15,00,000: 20%
- Above 15,00,000: 30%
- Standard deduction: 75,000
- No major deductions allowed (except 80CCH, 80IDD, 80P)

OLD REGIME:
- 0 - 2,50,000: 0%
- 2,50,001 - 5,00,000: 5%
- 5,00,001 - 10,00,000: 20%
- Above 10,00,000: 30%
- Standard deduction: 50,000
- All deductions allowed (80C, 80D, HRA, LTA, etc.)

4% Health & Education Cess applies on total tax.

Common deductions:
- 80C: Up to 1,50,000 (EPF, PPF, ELSS, LIC, NSC, etc.)
- 80D: Up to 25,000 self + 25,000 parents (50,000 if senior)
- 80CCD(1B): Up to 50,000 (NPS)
- HRA: Least of (50% of basic in metro, actual rent - 10% of basic, actual HRA received)
- Home loan interest 24(b): Up to 2,00,000

Rules:
- Calculate BOTH regimes accurately using the correct slabs.
- The recommended regime should be the one with lower total_tax.
- deduction_suggestions should be specific to the user's inputs and highlight what they're missing.
- Return ONLY the JSON object. No markdown fences, no explanation.
"""

# Agno agent for tax planning
_tax_agent = None


def _get_tax_agent() -> Agent:
    global _tax_agent
    if _tax_agent is None:
        _tax_agent = Agent(
            name="Tax Planning Advisor",
            model=get_agno_model(),
            instructions=[
                "You are an expert Indian tax planning advisor.",
                "Always return valid JSON only.",
                "Use the latest FY 2024-25 tax slabs for both old and new regimes.",
                "Recommend the regime that saves the most tax.",
            ],
            markdown=False,
        )
    return _tax_agent


def _calculate_tax_slab(taxable: float, slabs: list[tuple[float, float, float]]) -> float:
    """Calculate tax using progressive slabs. Each slab: (upper_limit, rate, base_tax)."""
    tax = 0.0
    prev = 0
    for upper, rate, base in slabs:
        if taxable <= prev:
            break
        taxable_in_slab = min(taxable, upper) - prev
        tax += taxable_in_slab * rate
        prev = upper
    return round(tax, 2)


def _fallback_tax(data: dict[str, Any]) -> dict[str, Any]:
    """Rule-based tax calculation — works without any API key."""
    income = float(data.get("annual_income", 0))
    basic = float(data.get("basic_salary", income * 0.5))
    hra_received = float(data.get("hra_received", 0))
    rent_paid = float(data.get("rent_paid", 0)) * 12  # monthly to annual
    is_metro = bool(data.get("is_metro", False))
    inv_80c = min(float(data.get("investments_80c", 0)), 150000)
    ins_80d = min(float(data.get("insurance_80d", 0)), 25000)
    nps = min(float(data.get("nps_80ccd", 0)), 50000)
    home_loan = min(float(data.get("home_loan_interest", 0)), 200000)
    other = float(data.get("other_deductions", 0))

    # --- OLD REGIME ---
    hra_exemption = 0
    if hra_received > 0 and rent_paid > 0:
        metro_pct = 0.5 if is_metro else 0.4
        hra_exemption = min(hra_received, rent_paid - basic * 0.1, basic * metro_pct)
        hra_exemption = max(0, hra_exemption)

    old_deductions = 50000 + inv_80c + ins_80d + nps + hra_exemption + home_loan + other
    old_taxable = max(0, income - old_deductions)
    old_slabs = [
        (250000, 0.0, 0), (500000, 0.05, 12500),
        (1000000, 0.20, 62500), (float('inf'), 0.30, 162500),
    ]
    old_tax = _calculate_tax_slab(old_taxable, old_slabs)
    old_cess = round(old_tax * 0.04, 2)
    old_total = round(old_tax + old_cess, 2)

    old_regime = {
        "gross_income": income, "total_deductions": round(old_deductions, 2),
        "taxable_income": round(old_taxable, 2), "tax_amount": old_tax,
        "cess": old_cess, "total_tax": old_total,
        "slab_breakdown": [
            {"slab": "0 - 2.5L", "rate": "0%", "tax": 0},
            {"slab": "2.5L - 5L", "rate": "5%", "tax": round(max(0, min(old_taxable, 500000) - 250000) * 0.05, 2)},
            {"slab": "5L - 10L", "rate": "20%", "tax": round(max(0, min(old_taxable, 1000000) - 500000) * 0.20, 2)},
            {"slab": "Above 10L", "rate": "30%", "tax": round(max(0, old_taxable - 1000000) * 0.30, 2)},
        ],
    }

    # --- NEW REGIME ---
    new_taxable = max(0, income - 75000)
    new_slabs = [
        (300000, 0.0, 0), (700000, 0.05, 0), (1000000, 0.10, 20000),
        (1200000, 0.15, 50000), (1500000, 0.20, 95000), (float('inf'), 0.30, 155000),
    ]
    new_tax = _calculate_tax_slab(new_taxable, new_slabs)
    new_cess = round(new_tax * 0.04, 2)
    new_total = round(new_tax + new_cess, 2)

    new_regime = {
        "gross_income": income, "standard_deduction": 75000,
        "taxable_income": round(new_taxable, 2), "tax_amount": new_tax,
        "cess": new_cess, "total_tax": new_total,
        "slab_breakdown": [
            {"slab": "0 - 3L", "rate": "0%", "tax": 0},
            {"slab": "3L - 7L", "rate": "5%", "tax": round(max(0, min(new_taxable, 700000) - 300000) * 0.05, 2)},
            {"slab": "7L - 10L", "rate": "10%", "tax": round(max(0, min(new_taxable, 1000000) - 700000) * 0.10, 2)},
            {"slab": "10L - 12L", "rate": "15%", "tax": round(max(0, min(new_taxable, 1200000) - 1000000) * 0.15, 2)},
            {"slab": "12L - 15L", "rate": "20%", "tax": round(max(0, min(new_taxable, 1500000) - 1200000) * 0.20, 2)},
            {"slab": "Above 15L", "rate": "30%", "tax": round(max(0, new_taxable - 1500000) * 0.30, 2)},
        ],
    }

    recommended = "old" if old_total < new_total else "new"

    suggestions = []
    if inv_80c < 150000:
        suggestions.append({"section": "80C", "description": "Invest remaining %s under 80C (EPF, PPF, ELSS, LIC)" % (150000 - inv_80c), "max_benefit": 150000 - inv_80c, "priority": "high"})
    if ins_80d < 25000:
        suggestions.append({"section": "80D", "description": "Get health insurance to claim up to 25,000 deduction", "max_benefit": 25000 - ins_80d, "priority": "high"})
    if nps < 50000:
        suggestions.append({"section": "80CCD(1B)", "description": "Invest in NPS for additional 50,000 deduction", "max_benefit": 50000 - nps, "priority": "medium"})
    if hra_received == 0 and rent_paid == 0:
        suggestions.append({"section": "HRA", "description": "If you pay rent, claim HRA exemption to save more tax", "max_benefit": round(basic * 0.5, 2) if is_metro else round(basic * 0.4, 2), "priority": "medium"})
    if home_loan == 0:
        suggestions.append({"section": "24(b)", "description": "Home loan interest gives up to 2,00,000 deduction", "max_benefit": 200000, "priority": "low"})

    tips = [
        "Invest in ELSS mutual funds for higher returns + 80C benefit",
        "Max out NPS contribution for extra 50,000 deduction under 80CCD(1B)",
        "Pay rent to parents (if applicable) to claim HRA if you don't have one",
    ]

    return {
        "old_regime": old_regime, "new_regime": new_regime,
        "recommended_regime": recommended,
        "savings": round(abs(old_total - new_total), 2),
        "deduction_suggestions": suggestions,
        "last_minute_tips": tips,
    }


def analyze_tax(data: dict[str, Any]) -> dict[str, Any]:
    """
    Run the Tax Planning Agent.
    Tries LLM first; falls back to rule-based calculation.
    """
    # Try LLM (Agno + LangChain)
    from services.nebius_config import has_valid_api_key
    if not has_valid_api_key():
        logger.info("No API key set, using rule-based fallback for analyze_tax")
        return _fallback_tax(data)

    user_input = json.dumps(data, indent=2)
    try:
        agent = _get_tax_agent()
        response = agent.run(user_input)
        content = response.content if hasattr(response, "content") else str(response)
        from services.nebius_config import parse_json_response
        result = parse_json_response(content)
        if "raw_response" not in result:
            return result
    except Exception as e:
        logger.warning("Agno agent failed: %s", e)

    # Try direct LLM call
    llm_result = call_agent_llm(TAX_SYSTEM_PROMPT, user_input)
    if llm_result and "raw_response" not in llm_result:
        return llm_result

    # Fallback: rule-based calculation
    logger.info("Using rule-based tax calculation fallback")
    return _fallback_tax(data)
