"""
Document routes — file upload and AI-powered document analysis.
"""

import os
import logging
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from services.document_service import process_uploaded_file

logger = logging.getLogger(__name__)

document_bp = Blueprint("document", __name__)


@document_bp.route("/upload_file", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    try:
        analysis = process_uploaded_file(file_path, filename)
        return jsonify({"analysis": analysis})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error("File processing error: %s", e)
        return jsonify({"error": f"Internal Server Error: {e}"}), 500
