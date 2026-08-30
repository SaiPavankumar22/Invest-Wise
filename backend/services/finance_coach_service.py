"""
Finance Coach Service — Multi-agent financial analysis via Nebius AI.

Replaces the Google ADK + Gemini setup with 3 sequential LLM calls through
the OpenAI-compatible Nebius API. Each call acts as a "specialized agent":
  1. Budget Analysis Agent
  2. Savings Strategy Agent
  3. Debt Reduction Agent
"""

import json
import logging
import re
from typing import Any

from openai import OpenAI

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Nebius config (reuses the same env vars as llm_service)
# ---------------------------------------------------------------------------

NEBIUS_BASE_URL = "https://api.studio.nebius.ai/v1"
NEBIUS_MODEL = "google/gemma-3-27b-it"

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        import os
        api_key = os.getenv("NEBIUS_API_KEY", "not-set")
        _client = OpenAI(base_url=NEBIUS_BASE_URL, api_key=api_key)
    return _client


# ---------------------------------------------------------------------------
# System prompts for each "agent"
# ---------------------------------------------------------------------------

BUDGET_ANALYSIS_PROMPT = """\
You are a Budget Analysis Agent. Given the user's financial data, return a
JSON object (and nothing else) with these keys:

{
  "total_expenses": <number>,
  "monthly_income": <number>,
  "spending_categories": [
    { "category": "<name>", "amount": <number>, "percentage": <number> }
  ],
  "recommendations": [
    { "category": "<name>", "recommendation": "<text>", "potential_savings": <number> }
  ]
}

Rules:
- Include ALL expense categories, percentages must add up to ~100.
- Provide 3-5 specific, actionable recommendations with estimated monthly savings.
- Return ONLY the JSON object, no markdown fences, no explanation.
"""

SAVINGS_STRATEGY_PROMPT = """\
You are a Savings Strategy Agent. Given the budget analysis below, return a
JSON object (and nothing else):

{
  "emergency_fund": {
    "recommended_amount": <number>,
    "current_amount": 0,
    "current_status": "<text>"
  },
  "recommendations": [
    { "category": "<name>", "amount": <number>, "rationale": "<text>" }
  ],
  "automation_techniques": [
    { "name": "<name>", "description": "<text>" }
  ]
}

Rules:
- Emergency fund = 6 × monthly expenses.
- Provide 3-5 savings allocation recommendations.
- Include 2-3 automation techniques.
- Return ONLY the JSON object, no markdown fences, no explanation.
"""

DEBT_REDUCTION_PROMPT = """\
You are a Debt Reduction Agent. Given the budget analysis and savings strategy
below, return a JSON object (and nothing else):

{
  "total_debt": <number>,
  "debts": [
    { "name": "<name>", "amount": <number>, "interest_rate": <number>, "min_payment": <number> }
  ],
  "payoff_plans": {
    "avalanche": {
      "total_interest": <number>,
      "months_to_payoff": <number>,
      "monthly_payment": <number>
    },
    "snowball": {
      "total_interest": <number>,
      "months_to_payoff": <number>,
      "monthly_payment": <number>
    }
  },
  "recommendations": [
    { "title": "<title>", "description": "<text>", "impact": "<text>" }
  ]
}

Rules:
- Create both avalanche (highest interest first) and snowball (smallest balance first) plans.
- Calculate total interest and months for each method.
- Provide 3-5 actionable debt reduction recommendations.
- Return ONLY the JSON object, no markdown fences, no explanation.
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _call_llm(system_prompt: str, user_message: str) -> dict[str, Any]:
    """Call Nebius LLM and parse JSON response."""
    client = _get_client()
    response = client.chat.completions.create(
        model=NEBIUS_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.4,
    )
    raw = response.choices[0].message.content.strip()
    # Strip markdown fences if the model wraps them anyway
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON, wrapping as text: %s", raw[:200])
        return {"raw_response": raw}


def _default_budget(monthly_income: float, expenses: dict, debts: list) -> dict:
    total = sum(expenses.values())
    return {
        "total_expenses": total,
        "monthly_income": monthly_income,
        "spending_categories": [
            {"category": cat, "amount": amt, "percentage": round(amt / total * 100, 1) if total else 0}
            for cat, amt in expenses.items() if amt > 0
        ],
        "recommendations": [
            {"category": "General", "recommendation": "Track your expenses for a month to identify saving opportunities.", "potential_savings": round(total * 0.1, 2)}
        ],
    }


def _default_savings(total_expenses: float, monthly_income: float) -> dict:
    return {
        "emergency_fund": {"recommended_amount": round(total_expenses * 6, 2), "current_amount": 0, "current_status": "Not started"},
        "recommendations": [
            {"category": "Emergency Fund", "amount": round(total_expenses * 0.1, 2), "rationale": "Build emergency fund first"},
            {"category": "Retirement", "amount": round(monthly_income * 0.15, 2), "rationale": "Long-term savings"},
        ],
        "automation_techniques": [{"name": "Automatic Transfer", "description": "Set up automatic transfers on payday"}],
    }


def _default_debt(debts: list) -> dict:
    total_debt = sum(d.get("amount", 0) for d in debts)
    return {
        "total_debt": total_debt,
        "debts": debts,
        "payoff_plans": {
            "avalanche": {"total_interest": round(total_debt * 0.2, 2), "months_to_payoff": 24, "monthly_payment": round(total_debt / 24, 2) if total_debt else 0},
            "snowball": {"total_interest": round(total_debt * 0.25, 2), "months_to_payoff": 24, "monthly_payment": round(total_debt / 24, 2) if total_debt else 0},
        },
        "recommendations": [{"title": "Increase Payments", "description": "Pay more than the minimum to reduce total interest.", "impact": "Reduces total interest paid"}],
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyze_finances(financial_data: dict[str, Any]) -> dict[str, Any]:
    """
    Run the 3-agent pipeline and return combined results.

    Parameters (in financial_data):
      - monthly_income: float
      - dependants: int
      - manual_expenses: dict[str, float]   (category → amount)
      - debts: list[dict]                    (name, amount, interest_rate, min_payment)
      - transactions: list[dict] (optional)  (Date, Category, Amount)
    """
    monthly_income = financial_data.get("monthly_income", 0)
    dependants = financial_data.get("dependants", 0)
    manual_expenses = financial_data.get("manual_expenses") or {}
    debts = financial_data.get("debts") or []
    transactions = financial_data.get("transactions")

    # If transactions were provided instead of manual expenses, aggregate them
    if not manual_expenses and transactions:
        manual_expenses = {}
        for t in transactions:
            cat = str(t.get("Category", "Other")).strip() or "Other"
            # Handle various amount formats: $1,200.00, "1200", 1200, etc.
            raw_amt = t.get("Amount", 0)
            if isinstance(raw_amt, str):
                raw_amt = re.sub(r'[\$£₹€,\s]', '', raw_amt)
            try:
                amt = float(raw_amt)
            except (ValueError, TypeError):
                continue
            if amt <= 0:
                continue
            manual_expenses[cat] = manual_expenses.get(cat, 0) + amt

    total_expenses = sum(manual_expenses.values())
    user_context = json.dumps({
        "monthly_income": monthly_income,
        "dependants": dependants,
        "total_expenses": total_expenses,
        "expenses": manual_expenses,
        "debts": debts,
    }, indent=2)

    results: dict[str, Any] = {}

    # --- Agent 1: Budget Analysis ---
    try:
        budget_context = f"{user_context}\n\nPlease analyze this budget data."
        results["budget_analysis"] = _call_llm(BUDGET_ANALYSIS_PROMPT, budget_context)
        logger.info("Budget analysis completed")
    except Exception as e:
        logger.error("Budget analysis failed: %s", e)
        results["budget_analysis"] = _default_budget(monthly_income, manual_expenses, debts)

    # --- Agent 2: Savings Strategy ---
    try:
        savings_context = (
            f"Original data:\n{user_context}\n\n"
            f"Budget analysis results:\n{json.dumps(results['budget_analysis'], indent=2)}\n\n"
            f"Please create a savings strategy."
        )
        results["savings_strategy"] = _call_llm(SAVINGS_STRATEGY_PROMPT, savings_context)
        logger.info("Savings strategy completed")
    except Exception as e:
        logger.error("Savings strategy failed: %s", e)
        results["savings_strategy"] = _default_savings(total_expenses, monthly_income)

    # --- Agent 3: Debt Reduction ---
    try:
        debt_context = (
            f"Original data:\n{user_context}\n\n"
            f"Budget analysis:\n{json.dumps(results['budget_analysis'], indent=2)}\n\n"
            f"Savings strategy:\n{json.dumps(results['savings_strategy'], indent=2)}\n\n"
            f"Please create a debt reduction plan."
        )
        results["debt_reduction"] = _call_llm(DEBT_REDUCTION_PROMPT, debt_context)
        logger.info("Debt reduction completed")
    except Exception as e:
        logger.error("Debt reduction failed: %s", e)
        results["debt_reduction"] = _default_debt(debts)

    return results
