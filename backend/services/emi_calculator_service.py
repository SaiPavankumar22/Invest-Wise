"""
EMI & Loan Comparison Agent — Compares EMIs across banks, calculates
total interest, and recommends the best lender.

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

EMI_SYSTEM_PROMPT = """\
You are an expert loan comparison advisor. Given the user's loan requirements,
return a JSON object (and nothing else) with these keys:

{
  "loan_summary": {
    "loan_amount": <number>,
    "tenure_years": <number>,
    "tenure_months": <number>
  },
  "comparisons": [
    {
      "bank": "<bank_name>",
      "interest_rate": <number>,
      "processing_fee": <number>,
      "monthly_emi": <number>,
      "total_interest": <number>,
      "total_payment": <number>,
      "prepayment_charges": "<text>",
      "special_offers": "<text>"
    }
  ],
  "amortization_highlights": {
    "year_1": { "principal_paid": <number>, "interest_paid": <number>, "balance": <number> },
    "year_5": { "principal_paid": <number>, "interest_paid": <number>, "balance": <number> },
    "year_10": { "principal_paid": <number>, "interest_paid": <number>, "balance": <number> }
  },
  "best_lender": {
    "name": "<bank_name>",
    "reason": "<text>",
    "total_savings": <number>
  },
  "prepayment_analysis": {
    "monthly_extra": <number>,
    "new_tenure_months": <number>,
    "interest_saved": <number>
  },
  "recommendations": [
    "<tip1>", "<tip2>"
  ]
}

EMI Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
where P = principal, r = monthly interest rate, n = number of months.

Rules:
- Compare at least 5 major Indian banks (SBI, HDFC, ICICI, Bank of Baroda, Punjab National Bank, Kotak, Axis).
- Interest rates should be realistic for Indian market (8.5% - 12% for home loans).
- Include processing fee as a percentage (typically 0.25% - 0.50%).
- prepayment_analysis: show how paying extra ₹X/month reduces tenure and saves interest.
- Generate amortization highlights for year 1, 5, and 10 (or total tenure if less).
- Return ONLY the JSON object. No markdown fences, no explanation.
"""

_emi_agent = None


def _get_emi_agent() -> Agent:
    global _emi_agent
    if _emi_agent is None:
        _emi_agent = Agent(
            name="EMI Comparison Advisor",
            model=get_agno_model(),
            instructions=[
                "You are an expert loan comparison advisor.",
                "Always return valid JSON only.",
                "Use accurate EMI calculations with the standard formula.",
                "Compare real Indian bank rates.",
            ],
            markdown=False,
        )
    return _emi_agent


BANK_RATES = {
    "home": [
        {"bank": "SBI", "rate": 8.50, "processing_fee": 0.35, "prepayment": "No charge after 3 years"},
        {"bank": "HDFC Bank", "rate": 8.75, "processing_fee": 0.50, "prepayment": "2%% penalty within 2 years"},
        {"bank": "ICICI Bank", "rate": 8.85, "processing_fee": 0.50, "prepayment": "No charge after 6 months"},
        {"bank": "Bank of Baroda", "rate": 8.60, "processing_fee": 0.25, "prepayment": "No prepayment charge"},
        {"bank": "Punjab National Bank", "rate": 8.55, "processing_fee": 0.25, "prepayment": "No charge"},
        {"bank": "Kotak Bank", "rate": 8.90, "processing_fee": 0.50, "prepayment": "2%% penalty within 1 year"},
        {"bank": "Axis Bank", "rate": 8.75, "processing_fee": 0.50, "prepayment": "1%% charge"},
    ],
    "car": [
        {"bank": "SBI", "rate": 8.75, "processing_fee": 0.25, "prepayment": "No charge"},
        {"bank": "HDFC Bank", "rate": 9.25, "processing_fee": 0.50, "prepayment": "2%% penalty"},
        {"bank": "ICICI Bank", "rate": 9.50, "processing_fee": 0.50, "prepayment": "No charge after 6 months"},
        {"bank": "Bank of Baroda", "rate": 8.90, "processing_fee": 0.25, "prepayment": "No charge"},
        {"bank": "Axis Bank", "rate": 9.25, "processing_fee": 0.50, "prepayment": "1%% charge"},
    ],
    "personal": [
        {"bank": "SBI", "rate": 11.50, "processing_fee": 1.0, "prepayment": "3%% penalty"},
        {"bank": "HDFC Bank", "rate": 10.75, "processing_fee": 1.0, "prepayment": "4%% penalty"},
        {"bank": "ICICI Bank", "rate": 10.99, "processing_fee": 1.0, "prepayment": "3%% penalty"},
        {"bank": "Axis Bank", "rate": 10.99, "processing_fee": 1.5, "prepayment": "No charge after 1 year"},
    ],
    "education": [
        {"bank": "SBI", "rate": 8.50, "processing_fee": 0.0, "prepayment": "No charge"},
        {"bank": "Bank of Baroda", "rate": 8.35, "processing_fee": 0.0, "prepayment": "No charge"},
        {"bank": "HDFC Bank", "rate": 9.00, "processing_fee": 0.50, "prepayment": "No charge"},
    ],
}


def _calc_emi(principal, annual_rate, months):
    r = annual_rate / 100 / 12
    if r == 0:
        return principal / months, principal, 0
    emi = principal * r * (1 + r) ** months / ((1 + r) ** months - 1)
    total = emi * months
    interest = total - principal
    return round(emi, 2), round(total, 2), round(interest, 2)


def _fallback_emi(data: dict[str, Any]) -> dict[str, Any]:
    """Rule-based EMI comparison — works without API key."""
    amount = float(data.get("loan_amount", 0))
    years = int(data.get("tenure_years", 10))
    loan_type = data.get("loan_type", "home")
    prepay = float(data.get("prepayment_amount", 0))
    months = years * 12

    rates = BANK_RATES.get(loan_type, BANK_RATES["home"])
    comparisons = []
    for b in rates:
        emi, total, interest = _calc_emi(amount, b["rate"], months)
        fee = round(amount * b["processing_fee"] / 100, 2)
        comparisons.append({"bank": b["bank"], "interest_rate": b["rate"], "processing_fee": fee, "monthly_emi": emi, "total_interest": interest, "total_payment": round(total + fee, 2), "prepayment_charges": b["prepayment"], "special_offers": ""})

    comparisons.sort(key=lambda x: x["monthly_emi"])
    best = comparisons[0]

    # Prepayment analysis
    prepay_analysis = {"monthly_extra": prepay, "new_tenure_months": months, "interest_saved": 0}
    if prepay > 0:
        r_best = best["interest_rate"] / 100 / 12
        new_emi = best["monthly_emi"] + prepay
        if r_best > 0 and new_emi > 0:
            n_new = 0
            balance = amount
            while balance > 0 and n_new < months * 2:
                interest_part = balance * r_best
                principal_part = new_emi - interest_part
                if principal_part <= 0:
                    break
                balance -= principal_part
                n_new += 1
            prepay_analysis = {"monthly_extra": prepay, "new_tenure_months": n_new, "interest_saved": round(best["total_interest"] - n_new * new_emi + amount, 2)}

    return {
        "loan_summary": {"loan_amount": amount, "tenure_years": years, "tenure_months": months},
        "comparisons": comparisons,
        "best_lender": {"name": best["bank"], "reason": "Lowest monthly EMI at %.2f%% interest" % best["interest_rate"], "total_savings": round(max(c["total_payment"] for c in comparisons) - best["total_payment"], 2)},
        "prepayment_analysis": prepay_analysis,
        "recommendations": ["Prepay during low-interest periods", "Compare processing fees along with interest rates", "Check for prepayment penalties before choosing"],
    }


def compare_emis(data: dict[str, Any]) -> dict[str, Any]:
    """Run the EMI Comparison Agent. Tries LLM first; falls back to calculation."""
    from services.nebius_config import has_valid_api_key
    if not has_valid_api_key():
        logger.info("No API key set, using rule-based fallback for compare_emis")
        return _fallback_emi(data)

    user_input = json.dumps(data, indent=2)
    try:
        agent = _get_emi_agent()
        response = agent.run(user_input)
        content = response.content if hasattr(response, "content") else str(response)
        from services.nebius_config import parse_json_response
        result = parse_json_response(content)
        if "raw_response" not in result:
            return result
    except Exception as e:
        logger.warning("Agno agent failed: %s", e)

    llm_result = call_agent_llm(EMI_SYSTEM_PROMPT, user_input)
    if llm_result and "raw_response" not in llm_result:
        return llm_result

    logger.info("Using rule-based EMI comparison fallback")
    return _fallback_emi(data)
