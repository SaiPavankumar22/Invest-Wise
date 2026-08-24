"""
InvestWise Backend — Flask application.

All business logic lives in the ``services`` package.  This file only wires
routes to those services.
"""

import os
import logging

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from services.llm_service import get_financial_advice
from services.youtube_service import fetch_youtube_videos
from services.investment_service import get_investment_recommendations
from services.scraper_service import (
    scrape_mutual_funds,
    scrape_lic_policies,
    scrape_post_office_policies,
    scrape_gold_prices,
    scrape_gold_rates,
)
from services.document_service import process_uploaded_file

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
])

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ---------------------------------------------------------------------------
# Routes — Financial Advisor (LLM)
# ---------------------------------------------------------------------------


@app.route("/ask", methods=["POST"])
def handle_query():
    data = request.json
    user_query = data.get("user_query", "")

    if not user_query:
        return jsonify({"error": "No query provided."}), 400

    try:
        response = get_financial_advice(user_query)
        return jsonify({"response": response})
    except Exception as e:
        logging.error("LLM error: %s", e)
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Routes — YouTube
# ---------------------------------------------------------------------------


@app.route("/get_videos", methods=["POST"])
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
        logging.error("YouTube fetch error: %s", e)
        return jsonify({"error": "Failed to fetch videos from YouTube API."}), 500


# ---------------------------------------------------------------------------
# Routes — Investment Recommendations
# ---------------------------------------------------------------------------


@app.route("/get_investment_options", methods=["POST"])
def get_investment_options():
    data = request.json
    logging.debug("Received data: %s", data)

    age = data.get("age")
    horizon = data.get("horizon")
    period = data.get("period")
    investment_type = data.get("investment_type")
    amount = data.get("amount")

    if None in [age, horizon, period, investment_type, amount]:
        return jsonify({"error": "All fields are required."}), 400

    recommendations = get_investment_recommendations(
        age, horizon, period, investment_type, amount
    )
    return jsonify({"recommended_investments": recommendations})


# ---------------------------------------------------------------------------
# Routes — Scraping (Mutual Funds, LIC, Post Office, Gold)
# ---------------------------------------------------------------------------


@app.route("/get-mutual-funds", methods=["GET"])
def get_mutual_funds():
    try:
        return jsonify(scrape_mutual_funds())
    except Exception as e:
        logging.error("Mutual fund scrape error: %s", e)
        return jsonify({"error": "Failed to retrieve data"}), 500


@app.route("/lic_policies", methods=["GET"])
def get_lic_policies():
    try:
        return jsonify(scrape_lic_policies())
    except Exception as e:
        logging.error("LIC scrape error: %s", e)
        return jsonify({"error": str(e)}), 500


@app.route("/post_office_policies", methods=["GET"])
def get_post_office_policies():
    try:
        return jsonify(scrape_post_office_policies())
    except Exception as e:
        logging.error("Post Office scrape error: %s", e)
        return jsonify({"error": str(e)}), 500


@app.route("/gold_prices", methods=["GET"])
def get_gold_prices():
    try:
        return jsonify(scrape_gold_prices())
    except Exception as e:
        logging.error("Gold price scrape error: %s", e)
        return jsonify({"error": str(e)}), 500


@app.route("/get_gold_rates", methods=["GET"])
def get_gold_rates():
    try:
        return jsonify(scrape_gold_rates())
    except Exception as e:
        logging.error("Gold rate scrape error: %s", e)
        return jsonify([]), 500


# ---------------------------------------------------------------------------
# Routes — Document Upload & Analysis
# ---------------------------------------------------------------------------


@app.route("/upload_file", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    try:
        analysis = process_uploaded_file(file_path, filename)
        return jsonify({"analysis": analysis})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logging.error("File processing error: %s", e)
        return jsonify({"error": f"Internal Server Error: {e}"}), 500


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)
