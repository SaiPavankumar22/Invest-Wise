"""
Goal-Based Financial Planner Agent — Calculates monthly SIP needed
for each financial goal, prioritizes goals, and creates an action plan.

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

GOAL_PLANNER_SYSTEM_PROMPT = """\
You are an expert goal-based financial planner. Given the user's goals and
financial situation, return a JSON object (and nothing else) with these keys:

{
  "financial_snapshot": {
    "monthly_income": <number>,
    "monthly_expenses": <number>,
    "available_for_goals": <number>,
    "current_savings": <number>
  },
  "goals": [
    {
      "name": "<goal_name>",
      "target_amount": <number>,
      "target_date": "<YYYY-MM-DD>",
      "years_remaining": <number>,
      "monthly_sip_needed": <number>,
      "lumpsum_today": <number>,
      "recommended_instruments": [
        { "name": "<instrument>", "allocation": <percentage>, "expected_return": "<%>" }
      ],
      "feasibility": "easily_achievable" | "stretch" | "difficult" | "needs_adjustment",
      "priority_score": <number 1-100>
    }
  ],
  "priority_order": [
    { "rank": <number>, "goal": "<name>", "reason": "<text>" }
  ],
  "monthly_budget_allocation": {
    "total_sip_needed": <number>,
    "surplus_deficit": <number>,
    "adjustment_suggestion": "<text>"
  },
  "acceleration_tips": [
    { "tip": "<text>", "potential_time_saved_months": <number> }
  ],
  "risk_assessment": {
    "overall_risk_level": "conservative" | "moderate" | "aggressive",
    "diversification_score": <number 1-100>,
    "suggestions": ["<suggestion1>"]
  }
}

Goal Types and Expected Instruments:
- House: Savings + Home Loan (SIP in balanced fund)
- Child Education: Sukanya Samriddhi (girls), PPF, Equity MF
- Marriage: Short-term debt + hybrid funds
- Car: Short-term SIP in liquid/debt fund
- Emergency Fund: Liquid fund + FD (6 months expenses)
- Retirement: Equity MF + NPS + PPF

Rules:
- SIP calculation: SIP = FV × r / ((1+r)^n - 1) where FV = target, r = monthly return, n = months.
- If total SIP needed > available income, suggest which goals to defer or reduce.
- Priority: Emergency fund > Retirement > Insurance > House > Education > Marriage > Car.
- Expected returns: Equity 12%, Debt 7%, Balanced 9%, PPF 7.1%, SSY 8.2%.
- Feasibility: easily_achievable (SIP < 20% income), stretch (20-40%), difficult (40-60%), needs_adjustment (>60%).
- Return ONLY the JSON object. No markdown fences, no explanation.
"""

_goal_agent = None


def _get_goal_agent() -> Agent:
    global _goal_agent
    if _goal_agent is None:
        _goal_agent = Agent(
            name="Goal-Based Planner",
            model=get_agno_model(),
            instructions=[
                "You are an expert goal-based financial planner.",
                "Always return valid JSON only.",
                "Prioritize goals logically: emergency > retirement > house > education.",
                "Be realistic about SIP amounts and feasibility.",
            ],
            markdown=False,
        )
    return _goal_agent


def _fallback_goals(data: dict[str, Any]) -> dict[str, Any]:
    """Rule-based goal planning — works without API key."""
    income = float(data.get("monthly_income", 100000))
    expenses = float(data.get("monthly_expenses", 40000))
    savings = float(data.get("current_savings", 0))
    goals = data.get("goals") or []
    available = income - expenses

    from datetime import datetime
    now = datetime.now()

    results = []
    total_sip = 0
    for g in goals:
        target = float(g.get("target_amount", 0))
        date_str = g.get("target_date", "2030-12-31")
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d")
        except:
            target_date = datetime(2030, 12, 31)
        years = max((target_date - now).days / 365.25, 0.5)
        months = int(years * 12)
        rate = 0.10 / 12  # 10% expected return
        if rate > 0 and months > 0:
            sip = (target - savings * (1 + 0.10) ** years) * rate / ((1 + rate) ** months - 1)
            sip = max(0, sip)
        else:
            sip = max(0, (target - savings) / months) if months > 0 else target
        total_sip += sip
        pct = total_sip / income * 100 if income > 0 else 100
        feasibility = "easily_achievable" if pct < 20 else "stretch" if pct < 40 else "difficult" if pct < 60 else "needs_adjustment"
        results.append({"name": g.get("name", "Goal"), "target_amount": target, "target_date": date_str, "years_remaining": round(years, 1), "monthly_sip_needed": round(sip, 2), "lumpsum_today": round(savings / max(len(goals), 1), 2), "recommended_instruments": [{"name": "Equity MF", "allocation": 60, "expected_return": "12%%"}, {"name": "Debt MF", "allocation": 40, "expected_return": "7%%"}], "feasibility": feasibility, "priority_score": 50})

    return {
        "financial_snapshot": {"monthly_income": income, "monthly_expenses": expenses, "available_for_goals": available, "current_savings": savings},
        "goals": results,
        "monthly_budget_allocation": {"total_sip_needed": round(total_sip, 2), "surplus_deficit": round(available - total_sip, 2), "adjustment_suggestion": "SIP is %.0f%% of income" % (total_sip / income * 100) if income > 0 else "Enter income"},
        "recommendations": ["Start with emergency fund (6 months expenses)", "Use step-up SIP: increase 10%% annually", "Diversify across equity, debt, and hybrid funds"],
    }


def plan_goals(data: dict[str, Any]) -> dict[str, Any]:
    """Run the Goal Planner. Tries LLM first; falls back to calculation."""
    from services.nebius_config import has_valid_api_key
    if not has_valid_api_key():
        logger.info("No API key set, using rule-based fallback for plan_goals")
        return _fallback_goals(data)

    user_input = json.dumps(data, indent=2)
    try:
        agent = _get_goal_agent()
        response = agent.run(user_input)
        content = response.content if hasattr(response, "content") else str(response)
        from services.nebius_config import parse_json_response
        result = parse_json_response(content)
        if "raw_response" not in result:
            return result
    except Exception as e:
        logger.warning("Agno agent failed: %s", e)

    llm_result = call_agent_llm(GOAL_PLANNER_SYSTEM_PROMPT, user_input)
    if llm_result and "raw_response" not in llm_result:
        return llm_result

    logger.info("Using rule-based goal planner fallback")
    return _fallback_goals(data)
