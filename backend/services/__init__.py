from services.llm_service import llm_client, get_financial_advice, analyze_document
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

__all__ = [
    "llm_client",
    "get_financial_advice",
    "analyze_document",
    "fetch_youtube_videos",
    "get_investment_recommendations",
    "scrape_mutual_funds",
    "scrape_lic_policies",
    "scrape_post_office_policies",
    "scrape_gold_prices",
    "scrape_gold_rates",
    "process_uploaded_file",
]
