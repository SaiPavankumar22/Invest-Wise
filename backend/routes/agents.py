"""
AI Agent routes — 6 financial analysis agents powered by Agno + LangChain + Nebius.

Each route validates input, calls the corresponding agent service,
and returns structured JSON results.
"""

import logging
from flask import Blueprint, request, jsonify

from services.tax_planning_service import analyze_tax
from services.retirement_calculator_service import calculate_retirement
from services.emi_calculator_service import compare_emis
from services.insurance_advisor_service import get_insurance_advice
from services.goal_planner_service import plan_goals
from services.credit_score_service import analyze_credit_score

logger = logging.getLogger(__name__)

agents_bp = Blueprint("agents", __name__)


# ---------------------------------------------------------------------------
# Tax Planning Agent
# ---------------------------------------------------------------------------

@agents_bp.route("/tax-planning", methods=["POST"])
def tax_planning_route():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided."}), 400
    if data.get("annual_income") is None:
        return jsonify({"error": "annual_income is required."}), 400
    try:
        return jsonify(analyze_tax(data))
    except Exception as e:
        logger.error("Tax planning error: %s", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Retirement Calculator Agent
# ---------------------------------------------------------------------------

@agents_bp.route("/retirement-calculator", methods=["POST"])
def retirement_calculator_route():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided."}), 400
    if data.get("current_age") is None:
        return jsonify({"error": "current_age is required."}), 400
    try:
        return jsonify(calculate_retirement(data))
    except Exception as e:
        logger.error("Retirement calculator error: %s", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# EMI & Loan Comparison Agent
# ---------------------------------------------------------------------------

@agents_bp.route("/emi-comparison", methods=["POST"])
def emi_comparison_route():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided."}), 400
    if data.get("loan_amount") is None:
        return jsonify({"error": "loan_amount is required."}), 400
    try:
        return jsonify(compare_emis(data))
    except Exception as e:
        logger.error("EMI comparison error: %s", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Insurance Advisor Agent
# ---------------------------------------------------------------------------

@agents_bp.route("/insurance-advisor", methods=["POST"])
def insurance_advisor_route():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided."}), 400
    if data.get("age") is None:
        return jsonify({"error": "age is required."}), 400
    try:
        return jsonify(get_insurance_advice(data))
    except Exception as e:
        logger.error("Insurance advisor error: %s", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Goal-Based Financial Planner Agent
# ---------------------------------------------------------------------------

@agents_bp.route("/goal-planner", methods=["POST"])
def goal_planner_route():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided."}), 400
    if not data.get("goals"):
        return jsonify({"error": "goals list is required."}), 400
    try:
        return jsonify(plan_goals(data))
    except Exception as e:
        logger.error("Goal planner error: %s", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Credit Score Improvement Agent
# ---------------------------------------------------------------------------

@agents_bp.route("/credit-score", methods=["POST"])
def credit_score_route():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided."}), 400
    try:
        return jsonify(analyze_credit_score(data))
    except Exception as e:
        logger.error("Credit score error: %s", e)
        return jsonify({"error": str(e)}), 500
