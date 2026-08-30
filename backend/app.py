"""
InvestWise Backend — Flask application entry point.

Initializes Flask, CORS, MongoDB, and registers all route blueprints
from the ``routes`` package. Business logic lives in ``services/``.
"""

import os
import logging

from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from pymongo import MongoClient

from routes.auth import register_auth_routes
from routes.financial import financial_bp
from routes.agents import agents_bp
from routes.scrapers import scrapers_bp
from routes.document import document_bp

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

# --- Logging: quiet noisy libs, keep our route/service logs visible ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
# Suppress verbose internal logs from pymongo, httpcore, openai, httpx
for _noisy in ("pymongo", "httpcore", "openai", "httpx", "urllib3", "agno", "langchain", "langchain_openai"):
    logging.getLogger(_noisy).setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost",
    "http://127.0.0.1",
])

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ---------------------------------------------------------------------------
# MongoDB
# ---------------------------------------------------------------------------

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
JWT_SECRET = os.getenv("JWT_SECRET", "investwise-secret-key-change-in-production")
JWT_EXPIRY_HOURS = 72

try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    db = mongo_client["investwise"]
    users_collection = db["users"]
    users_collection.create_index("email", unique=True)
    users_collection.create_index("username", unique=True)
    logging.info("Connected to MongoDB at %s", MONGO_URI)
except Exception as e:
    logging.warning("MongoDB not available: %s. Auth will not work.", e)
    users_collection = None

# ---------------------------------------------------------------------------
# Request logging — shows every route call
# ---------------------------------------------------------------------------

@app.before_request
def log_request():
    logger.info("--> %s %s", request.method, request.path)


@app.after_request
def log_response(response):
    logger.info("<-- %s %s [%s]", request.method, request.path, response.status_code)
    return response


# ---------------------------------------------------------------------------
# Register Blueprints
# ---------------------------------------------------------------------------

register_auth_routes(app, users_collection, JWT_SECRET, JWT_EXPIRY_HOURS)
app.register_blueprint(financial_bp)
app.register_blueprint(agents_bp)
app.register_blueprint(scrapers_bp)
app.register_blueprint(document_bp)

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)
