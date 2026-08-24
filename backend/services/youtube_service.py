"""
YouTube Service — Fetches investment-related video links via the YouTube Data API v3.
"""

import os
import logging
import requests

logger = logging.getLogger(__name__)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
YOUTUBE_BASE_URL = os.getenv(
    "YOUTUBE_BASE_URL",
    "https://www.googleapis.com/youtube/v3",
)


def fetch_youtube_videos(question: str, max_results: int = 5) -> list[str]:
    """
    Search YouTube for videos matching *question* and return a list of URLs.

    Raises ``requests.exceptions.RequestException`` on network errors and
    returns an empty list if the API returns an error payload.
    """
    if not question:
        raise ValueError("question must not be empty")

    params = {
        "part": "snippet",
        "q": question,
        "key": YOUTUBE_API_KEY,
        "type": "video",
        "maxResults": max_results,
    }

    response = requests.get(YOUTUBE_BASE_URL, params=params, timeout=15)
    response.raise_for_status()

    data = response.json()

    if "error" in data:
        error_msg = data["error"].get("message", "Unknown YouTube API error")
        logger.error("YouTube API error: %s", error_msg)
        raise ValueError(error_msg)

    return [
        f"https://www.youtube.com/watch?v={item['id']['videoId']}"
        for item in data.get("items", [])
    ]
