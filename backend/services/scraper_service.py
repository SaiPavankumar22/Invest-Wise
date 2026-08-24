"""
Scraper Service — Web scraping for financial data sources.
"""

import logging
from datetime import datetime

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

_USER_AGENT = {"User-Agent": "Mozilla/5.0"}


# ---------------------------------------------------------------------------
# Mutual Funds (ET Money)
# ---------------------------------------------------------------------------

def scrape_mutual_funds() -> list[dict]:
    """Scrape featured mutual funds from ET Money."""
    url = "https://www.etmoney.com/mutual-funds/featured"
    response = requests.get(url, headers=_USER_AGENT, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    items = soup.find_all("div", class_="feature-category-item-list")

    funds: list[dict] = []
    for item in items:
        for fund in item.find_all("div", class_="item"):
            title_tag = fund.find("h4", class_="h4")
            img_tag = fund.find("img")
            a_tag = fund.find("a")
            if not (title_tag and a_tag):
                continue
            funds.append({
                "title": title_tag.text.strip(),
                "image": img_tag["src"] if img_tag else "",
                "link": "https://www.etmoney.com" + a_tag["href"],
            })

    return funds


# ---------------------------------------------------------------------------
# LIC Policies
# ---------------------------------------------------------------------------

def scrape_lic_policies() -> dict:
    """Scrape insurance policies from LIC India."""
    url = "https://licindia.in/insurance-plan"
    response = requests.get(url, headers=_USER_AGENT, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    target_categories = {
        "Endowment Plans",
        "Money Back Plans",
        "Term Insurance Plans",
        "Pension Plans",
    }
    policy_categories: dict[str, list[dict]] = {}

    for accordion_item in soup.find_all("div", class_="accordion-item"):
        category_button = accordion_item.find("button", class_="accordion-button")
        if not category_button:
            continue

        category_name = category_button.text.strip()
        if category_name not in target_categories:
            continue

        policies: list[dict] = []
        table = accordion_item.find("table", class_="table")
        if table:
            for row in table.find("tbody").find_all("tr"):
                cols = row.find_all("td")
                if len(cols) < 2:
                    continue
                link_tag = cols[1].find("a")
                if not link_tag:
                    continue

                title = link_tag.text.strip()
                link = link_tag["href"]
                description = cols[2].text.strip() if len(cols) > 2 else ""
                if not link.startswith("http"):
                    link = "https://licindia.in" + link

                policies.append({
                    "title": title,
                    "link": link,
                    "description": description,
                })

        policy_categories[category_name] = policies

    return policy_categories


# ---------------------------------------------------------------------------
# Post Office Schemes
# ---------------------------------------------------------------------------

def scrape_post_office_policies() -> dict:
    """Scrape saving schemes from India Post."""
    url = "https://www.indiapost.gov.in/Financial/pages/content/post-office-saving-schemes.aspx"
    response = requests.get(url, headers=_USER_AGENT, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    policies: dict[str, list[dict]] = {}

    for item in soup.find_all("li", class_="li_header"):
        title_tag = item.find("a")
        content_tag = item.find("div", class_="li_content")
        if not (title_tag and content_tag):
            continue

        title = title_tag.text.strip()
        description = content_tag.get_text(strip=True)

        lower_title = title.lower()
        if "saving" in lower_title:
            category = "Savings Schemes"
        elif "deposit" in lower_title:
            category = "Time Deposits"
        elif "income" in lower_title:
            category = "Monthly Income Schemes"
        elif "senior" in lower_title:
            category = "Senior Citizens Schemes"
        elif "recurring" in lower_title:
            category = "Recurring Deposits"
        else:
            category = "Other Schemes"

        policies.setdefault(category, []).append({
            "title": title,
            "description": description,
            "interestRate": "Varies",
            "minInvestment": "Depends on scheme",
            "tenure": "Depends on scheme",
            "link": url,
        })

    return policies


# ---------------------------------------------------------------------------
# Gold Prices — Economic Times
# ---------------------------------------------------------------------------

def scrape_gold_prices() -> dict:
    """Scrape gold price data from Economic Times."""
    url = "https://economictimes.indiatimes.com/markets/gold-rate"
    response = requests.get(url, headers=_USER_AGENT, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    gold_data: list[dict] = []
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    current_price_div = soup.find("div", class_="goldPrice")
    if current_price_div:
        span = current_price_div.find("span")
        if span:
            gold_data.append({
                "type": "Current 24K Gold Price",
                "price": span.text.strip(),
                "change": "N/A",
                "timestamp": now,
            })

    table = soup.find("table", class_="goldSilverTable")
    if table:
        for row in table.find("tbody").find_all("tr"):
            cols = row.find_all("td")
            if len(cols) >= 3:
                gold_data.append({
                    "type": cols[0].text.strip(),
                    "price": cols[1].text.strip(),
                    "change": cols[2].text.strip(),
                    "timestamp": now,
                })

    return {
        "categories": {
            "Current Prices": [d for d in gold_data if d["type"] == "Current 24K Gold Price"],
            "Historical Prices": [d for d in gold_data if d["type"] != "Current 24K Gold Price"],
        }
    }


# ---------------------------------------------------------------------------
# Gold Rates — BankBazaar (city-wise)
# ---------------------------------------------------------------------------

def scrape_gold_rates() -> list[dict]:
    """Scrape city-wise gold rates from BankBazaar."""
    url = "https://www.bankbazaar.com/gold-rate-india.html"
    response = requests.get(url, headers=_USER_AGENT, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    gold_rates: list[dict] = []
    tbody = table.find("tbody")
    if not tbody:
        return []

    for row in tbody.find_all("tr"):
        cols = row.find_all("td")
        if len(cols) < 3:
            continue
        gold_rates.append({
            "city": cols[0].text.strip(),
            "gold_22k": cols[1].text.strip(),
            "gold_24k": cols[2].text.strip(),
        })

    return gold_rates
