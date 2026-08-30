"""
Financial routes — AI advisor, investment recommendations, finance coach,
YouTube videos, and investment options.
"""

import logging
from flask import Blueprint, request, jsonify

from services.llm_service import get_financial_advice
from services.youtube_service import fetch_youtube_videos
from services.investment_service import get_investment_recommendations
from services.finance_coach_service import analyze_finances

logger = logging.getLogger(__name__)

financial_bp = Blueprint("financial", __name__)


# ---------------------------------------------------------------------------
# Financial Advisor (LLM)
# ---------------------------------------------------------------------------

@financial_bp.route("/ask", methods=["POST"])
def handle_query():
    data = request.json
    user_query = data.get("user_query", "")
    if not user_query:
        return jsonify({"error": "No query provided."}), 400
    try:
        response = get_financial_advice(user_query)
        return jsonify({"response": response})
    except Exception as e:
        logger.error("LLM error: %s", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# YouTube
# ---------------------------------------------------------------------------

@financial_bp.route("/get_videos", methods=["POST"])
def get_video_links():
    data = request.json
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No query provided."}), 400
    try:
        videos = fetch_youtube_videos(question)
        return jsonify({"videos": videos})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error("YouTube fetch error: %s", e)
        return jsonify({"error": "Failed to fetch videos from YouTube API."}), 500


# ---------------------------------------------------------------------------
# Investment Recommendations
# ---------------------------------------------------------------------------

@financial_bp.route("/get_investment_options", methods=["POST"])
def get_investment_options():
    data = request.json
    logger.debug("Received data: %s", data)
    age = data.get("age")
    horizon = data.get("horizon")
    period = data.get("period")
    investment_type = data.get("investment_type")
    amount = data.get("amount")
    if None in [age, horizon, period, investment_type, amount]:
        return jsonify({"error": "All fields are required."}), 400
    recommendations = get_investment_recommendations(age, horizon, period, investment_type, amount)
    return jsonify({"recommended_investments": recommendations})


# ---------------------------------------------------------------------------
# Finance Coach (Multi-Agent Analysis)
# ---------------------------------------------------------------------------

@financial_bp.route("/analyze-finances", methods=["POST"])
def analyze_finances_route():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided."}), 400
    monthly_income = data.get("monthly_income")
    if monthly_income is None:
        return jsonify({"error": "monthly_income is required."}), 400
    try:
        results = analyze_finances(data)
        return jsonify(results)
    except Exception as e:
        logger.error("Finance coach error: %s", e)
        return jsonify({"error": str(e)}), 500
