"""
Investment Service — Rule-based investment recommendations.
"""

import logging

logger = logging.getLogger(__name__)

# Each entry: (name, (min_age, max_age), horizon, min_period_years, accepted_types, risk)
_INVESTMENTS: list[dict] = [
    {"name": "Real Estate Investment", "age_range": (25, 50), "horizon": "long", "min_period": 5, "type": "lumpsum", "risk": "medium-high"},
    {"name": "Fixed Deposit",         "age_range": (0, 100),  "horizon": "both", "min_period": 1, "type": "lumpsum", "risk": "low"},
    {"name": "Gold Investment",        "age_range": (0, 100),  "horizon": "both", "min_period": 0, "type": "lumpsum", "risk": "medium"},
    {"name": "Share Market",           "age_range": (20, 45),  "horizon": "long", "min_period": 5, "type": "both",   "risk": "high"},
    {"name": "SWP Mutual Funds",       "age_range": (35, 100), "horizon": "long", "min_period": 5, "type": "recurring", "risk": "medium"},
    {"name": "Index Funds",            "age_range": (20, 50),  "horizon": "long", "min_period": 5, "type": "both",   "risk": "medium"},
    {"name": "ULIP Plans",             "age_range": (25, 45),  "horizon": "long", "min_period": 10, "type": "recurring", "risk": "medium"},
    {"name": "Post Office Schemes",    "age_range": (30, 100), "horizon": "both", "min_period": 1, "type": "recurring", "risk": "low"},
    {"name": "Startup Investment",     "age_range": (25, 40),  "horizon": "long", "min_period": 5, "type": "lumpsum", "risk": "high"},
    {"name": "Senior Citizen Savings", "age_range": (60, 100), "horizon": "long", "min_period": 5, "type": "lumpsum", "risk": "low"},
    {"name": "REIT",                   "age_range": (25, 50),  "horizon": "long", "min_period": 5, "type": "lumpsum", "risk": "medium"},
    {"name": "LIC",                    "age_range": (0, 100),  "horizon": "both", "min_period": 0, "type": "both",   "risk": "low-medium"},
]


def get_investment_recommendations(
    age: int,
    horizon: str,
    period: int,
    investment_type: str,
    amount: float | None = None,
) -> list[str]:
    """Return a list of investment names matching the given criteria."""
    recommended: list[str] = []

    for inv in _INVESTMENTS:
        age_ok = inv["age_range"][0] <= age <= inv["age_range"][1]
        horizon_ok = inv["horizon"] == horizon.lower() or inv["horizon"] == "both"
        period_ok = period >= inv["min_period"]
        type_ok = inv["type"] == investment_type.lower() or inv["type"] == "both"

        if age_ok and horizon_ok and period_ok and type_ok:
            recommended.append(inv["name"])

    logger.debug("Recommendations for age=%s horizon=%s: %s", age, horizon, recommended)
    return recommended
