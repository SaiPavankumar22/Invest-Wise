"""
Scraper routes — live market data from Economic Times, LIC, India Post.
"""

import logging
from flask import Blueprint, request, jsonify

from services.scraper_service import (
    scrape_mutual_funds,
    scrape_lic_policies,
    scrape_post_office_policies,
    scrape_gold_prices,
    scrape_gold_rates,
)

logger = logging.getLogger(__name__)

scrapers_bp = Blueprint("scrapers", __name__)


@scrapers_bp.route("/get-mutual-funds", methods=["GET"])
def get_mutual_funds():
    try:
        return jsonify(scrape_mutual_funds())
    except Exception as e:
        logger.error("Mutual fund scrape error: %s", e)
        return jsonify({"error": "Failed to retrieve data"}), 500


@scrapers_bp.route("/lic_policies", methods=["GET"])
def get_lic_policies():
    try:
        return jsonify(scrape_lic_policies())
    except Exception as e:
        logger.error("LIC scrape error: %s", e)
        return jsonify({"error": str(e)}), 500


@scrapers_bp.route("/post_office_policies", methods=["GET"])
def get_post_office_policies():
    try:
        return jsonify(scrape_post_office_policies())
    except Exception as e:
        logger.error("Post Office scrape error: %s", e)
        return jsonify({"error": str(e)}), 500


@scrapers_bp.route("/gold_prices", methods=["GET"])
def get_gold_prices():
    try:
        return jsonify(scrape_gold_prices())
    except Exception as e:
        logger.error("Gold price scrape error: %s", e)
        return jsonify({"error": str(e)}), 500


@scrapers_bp.route("/get_gold_rates", methods=["GET"])
def get_gold_rates():
    try:
        return jsonify(scrape_gold_rates())
    except Exception as e:
        logger.error("Gold rate scrape error: %s", e)
        return jsonify([]), 500
