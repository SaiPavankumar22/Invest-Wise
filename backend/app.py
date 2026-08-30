"""
InvestWise Backend — Flask application.

All business logic lives in the ``services`` package.  This file only wires
routes to those services.
"""

import os
import logging
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import bcrypt
import jwt
from pymongo import MongoClient

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
from services.finance_coach_service import analyze_finances

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
# MongoDB Configuration
# ---------------------------------------------------------------------------

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
JWT_SECRET = os.getenv("JWT_SECRET", "investwise-secret-key-change-in-production")
JWT_EXPIRY_HOURS = 72

try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    db = mongo_client["investwise"]
    users_collection = db["users"]
    # Create unique index on email
    users_collection.create_index("email", unique=True)
    users_collection.create_index("username", unique=True)
    logging.info("Connected to MongoDB at %s", MONGO_URI)
except Exception as e:
    logging.warning("MongoDB not available: %s. Auth will not work.", e)
    users_collection = None


# ---------------------------------------------------------------------------
# Auth Helpers
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def generate_token(user_id: str, username: str) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_user_from_request():
    """Extract user from Authorization header. Returns user dict or None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    payload = verify_token(token)
    if not payload:
        return None
    if users_collection is None:
        return None
    try:
        from bson import ObjectId
        user = users_collection.find_one({"_id": ObjectId(payload["user_id"])})
        return user
    except Exception:
        return None

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
# Routes — Finance Coach (Multi-Agent Analysis)
# ---------------------------------------------------------------------------


@app.route("/analyze-finances", methods=["POST"])
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
        logging.error("Finance coach error: %s", e)
        return jsonify({"error": str(e)}), 500


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
# Routes — Authentication (MongoDB)
# ---------------------------------------------------------------------------


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if users_collection is None:
        return jsonify({"error": "Database not available."}), 503

    # Check if user exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered."}), 409

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already taken."}), 409

    try:
        user_doc = {
            "username": username,
            "email": email,
            "password": hash_password(password),
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
            "created_at": datetime.now(timezone.utc),
        }
        result = users_collection.insert_one(user_doc)
        token = generate_token(str(result.inserted_id), username)
        return jsonify({
            "message": "Account created successfully.",
            "jwtToken": token,
            "user": {
                "id": str(result.inserted_id),
                "username": username,
                "email": email,
                "avatar": user_doc["avatar"],
            }
        }), 201
    except Exception as e:
        logging.error("Signup error: %s", e)
        return jsonify({"error": "Failed to create account."}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    if users_collection is None:
        return jsonify({"error": "Database not available."}), 503

    user = users_collection.find_one({"username": username})
    if not user or not check_password(password, user["password"]):
        return jsonify({"error": "Invalid username or password."}), 401

    token = generate_token(str(user["_id"]), user["username"])
    return jsonify({
        "jwtToken": token,
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "avatar": user.get("avatar", ""),
        }
    })


@app.route("/profile", methods=["GET"])
def get_profile():
    user = get_user_from_request()
    if not user:
        return jsonify({"error": "Unauthorized."}), 401

    return jsonify({
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "avatar": user.get("avatar", ""),
            "created_at": user.get("created_at", "").isoformat() if isinstance(user.get("created_at"), datetime) else str(user.get("created_at", "")),
        }
    })


@app.route("/profile", methods=["PUT"])
def update_profile():
    user = get_user_from_request()
    if not user:
        return jsonify({"error": "Unauthorized."}), 401

    data = request.json
    updates = {}
    if "username" in data:
        updates["username"] = data["username"].strip()
    if "email" in data:
        updates["email"] = data["email"].strip().lower()

    if not updates:
        return jsonify({"error": "No fields to update."}), 400

    try:
        from bson import ObjectId
        users_collection.update_one({"_id": ObjectId(user["_id"])}, {"$set": updates})
        updated_user = users_collection.find_one({"_id": ObjectId(user["_id"])})
        return jsonify({
            "message": "Profile updated.",
            "user": {
                "id": str(updated_user["_id"]),
                "username": updated_user["username"],
                "email": updated_user["email"],
                "avatar": updated_user.get("avatar", ""),
            }
        })
    except Exception as e:
        logging.error("Profile update error: %s", e)
        return jsonify({"error": "Failed to update profile."}), 500


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)
