"""
LLM Service — Uses Nebius AI Studio (OpenAI-compatible) with Google Gemma 2 27B IT.
Replaces the previous Gemini + Groq setup.
"""

import os
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Nebius client (OpenAI-compatible)
# ---------------------------------------------------------------------------

NEBIUS_BASE_URL = os.getenv("NEBIUS_BASE_URL", "https://api.studio.nebius.ai/v1")
NEBIUS_API_KEY = os.getenv("NEBIUS_API_KEY", "")
NEBIUS_MODEL = os.getenv("NEBIUS_MODEL", "google/gemma-2-27b-it")


def _get_client() -> OpenAI:
    """Return an OpenAI-compatible client pointing at Nebius."""
    return OpenAI(base_url=NEBIUS_BASE_URL, api_key=NEBIUS_API_KEY)


llm_client = _get_client()


# ---------------------------------------------------------------------------
# Financial advisor prompt
# ---------------------------------------------------------------------------

FINANCIAL_ADVICE_SYSTEM_PROMPT = """\
You are an experienced financial planner. Your task is to provide clear and \
comprehensive advice on financial investments.

Rules:
- Only answer queries strictly related to finance, investments, or financial \
planning.
- If the query is unrelated, respond with:
  'This query is not related to finance. Please ask questions about financial \
investments or planning.'
- Provide actionable steps, potential risks, and benefits if applicable.
- Format your response in plain text only. Do not use markdown.
"""


def get_financial_advice(user_query: str) -> str:
    """Send a user query to the Nebius LLM and return the response text."""
    if not user_query:
        raise ValueError("user_query must not be empty")

    response = llm_client.chat.completions.create(
        model=NEBIUS_MODEL,
        messages=[
            {"role": "system", "content": FINANCIAL_ADVICE_SYSTEM_PROMPT},
            {"role": "user", "content": user_query},
        ],
        temperature=0.6,
    )

    return response.choices[0].message.content.strip()


# ---------------------------------------------------------------------------
# Document analysis prompt
# ---------------------------------------------------------------------------

DOCUMENT_ANALYSIS_SYSTEM_PROMPT = """\
You are an experienced financial professional with expertise in investments, \
banking, and financial instruments.

Analyze the provided document text and return a JSON object with these keys:
- "document_type": Type of document
- "explanation": Full explanation of the document
- "key_details": List of critical financial details
- "calculations": List of calculations based on the information
- "insights": Additional useful insights

If the document is NOT related to finance, investments, or banking, respond \
with: 'This document is not financial-related.'
"""


def analyze_document(text: str) -> str:
    """Analyze financial document text using the Nebius LLM."""
    if not text.strip():
        raise ValueError("Document text must not be empty")

    response = llm_client.chat.completions.create(
        model=NEBIUS_MODEL,
        messages=[
            {"role": "system", "content": DOCUMENT_ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        temperature=0.6,
    )

    return response.choices[0].message.content.strip()
