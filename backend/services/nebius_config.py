"""
Shared Agno + LangChain configuration for all financial agents.

Uses Agno's OpenAIChat model class with Nebius as the OpenAI-compatible
provider, and LangChain for prompt templates and structured output parsing.
"""

import os
import json
import re
import logging
from typing import Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Nebius connection (env vars shared across all agents)
# ---------------------------------------------------------------------------

NEBIUS_BASE_URL = os.getenv("NEBIUS_BASE_URL", "https://api.studio.nebius.ai/v1")
NEBIUS_API_KEY = os.getenv("NEBIUS_API_KEY", "")
NEBIUS_MODEL = os.getenv("NEBIUS_MODEL", "google/gemma-3-27b-it")


def has_valid_api_key() -> bool:
    """Check if a real Nebius API key is configured."""
    return bool(NEBIUS_API_KEY and NEBIUS_API_KEY not in ("not-set", "", "your_key", "placeholder"))


def get_llm(temperature: float = 0.4) -> ChatOpenAI:
    """Return a LangChain ChatOpenAI client pointed at Nebius."""
    return ChatOpenAI(
        model=NEBIUS_MODEL,
        base_url=NEBIUS_BASE_URL,
        api_key=NEBIUS_API_KEY,
        temperature=temperature,
    )


def get_agno_model():
    """Return an Agno OpenAIChat model pointed at Nebius.

    IMPORTANT: Override role_map to keep 'system' as 'system' instead of
    Agno's default which maps it to 'developer' (OpenAI v2 API).
    Nebius only accepts: system, user, assistant, tool.
    """
    from agno.models.openai import OpenAIChat
    return OpenAIChat(
        id=NEBIUS_MODEL,
        base_url=NEBIUS_BASE_URL,
        api_key=NEBIUS_API_KEY,
        temperature=0.4,
        role_map={
            "system": "system",
            "user": "user",
            "assistant": "assistant",
            "tool": "tool",
            "model": "assistant",
        },
    )


# ---------------------------------------------------------------------------
# Shared prompt template helper
# ---------------------------------------------------------------------------

def build_prompt(system_template: str) -> ChatPromptTemplate:
    """Build a ChatPromptTemplate from a system message template."""
    return ChatPromptTemplate.from_messages([
        ("system", system_template),
        ("human", "{input}"),
    ])


def parse_json_response(text: str) -> dict[str, Any]:
    """Robustly extract JSON from LLM output."""
    # Strip markdown fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Non-JSON response: %s", cleaned[:200])
        return {"raw_response": cleaned}


def call_agent_llm(system_prompt: str, user_input: str, temperature: float = 0.4) -> dict[str, Any]:
    """
    Convenience function: build prompt → call Nebius via LangChain → parse JSON.
    Used by all 6 agent services. Returns None on any API error.
    """
    try:
        llm = get_llm(temperature=temperature)
        chain = build_prompt(system_prompt) | llm
        result = chain.invoke({"input": user_input})
        return parse_json_response(result.content)
    except Exception as e:
        logger.warning("LLM call failed (will use fallback): %s", e)
        return None
