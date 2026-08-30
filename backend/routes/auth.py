"""
Authentication routes — signup, login, profile management.

Uses MongoDB for user storage and JWT for session tokens.
"""

import logging
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from bson import ObjectId
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)

# These are set by register_auth_routes() from app.py
_users_collection = None
_jwt_secret = ""
_jwt_expiry_hours = 72


def register_auth_routes(app, users_collection, jwt_secret, jwt_expiry_hours=72):
    """Wire up the auth blueprint with app-level config."""
    global _users_collection, _jwt_secret, _jwt_expiry_hours
    _users_collection = users_collection
    _jwt_secret = jwt_secret
    _jwt_expiry_hours = jwt_expiry_hours
    app.register_blueprint(auth_bp)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def _generate_token(user_id: str, username: str) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=_jwt_expiry_hours),
    }
    return jwt.encode(payload, _jwt_secret, algorithm="HS256")


def _verify_token(token: str):
    try:
        return jwt.decode(token, _jwt_secret, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def get_user_from_request():
    """Extract user from Authorization header. Returns user dict or None."""
    from flask import request as req
    auth_header = req.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    payload = _verify_token(token)
    if not payload or _users_collection is None:
        return None
    try:
        return _users_collection.find_one({"_id": ObjectId(payload["user_id"])})
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    if _users_collection is None:
        return jsonify({"error": "Database not available."}), 503
    if _users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered."}), 409
    if _users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already taken."}), 409

    try:
        user_doc = {
            "username": username,
            "email": email,
            "password": _hash_password(password),
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
            "created_at": datetime.now(timezone.utc),
        }
        result = _users_collection.insert_one(user_doc)
        token = _generate_token(str(result.inserted_id), username)
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
        logger.error("Signup error: %s", e)
        return jsonify({"error": "Failed to create account."}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400
    if _users_collection is None:
        return jsonify({"error": "Database not available."}), 503

    user = _users_collection.find_one({"username": username})
    if not user or not _check_password(password, user["password"]):
        return jsonify({"error": "Invalid username or password."}), 401

    token = _generate_token(str(user["_id"]), user["username"])
    return jsonify({
        "jwtToken": token,
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "avatar": user.get("avatar", ""),
        }
    })


@auth_bp.route("/profile", methods=["GET"])
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
            "created_at": user.get("created_at", "").isoformat()
                if isinstance(user.get("created_at"), datetime)
                else str(user.get("created_at", "")),
        }
    })


@auth_bp.route("/profile", methods=["PUT"])
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
        _users_collection.update_one({"_id": ObjectId(user["_id"])}, {"$set": updates})
        updated_user = _users_collection.find_one({"_id": ObjectId(user["_id"])})
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
        logger.error("Profile update error: %s", e)
        return jsonify({"error": "Failed to update profile."}), 500
