"""
Scraper Service — Web scraping for financial data sources.
"""

import logging
from datetime import datetime

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

_USER_AGENT = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


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
# Post Office Schemes (curated data — India Post website is JS-rendered)
# ---------------------------------------------------------------------------

def scrape_post_office_policies() -> dict:
    """
    Return Post Office savings scheme data.

    The India Post website is JS-rendered, so we provide curated scheme data
    based on the latest government-published rates and terms.
    """
    return {
        "Savings Schemes": [
            {
                "title": "Post Office Savings Account",
                "description": "Basic savings account with 4% annual interest. Minimum deposit Rs. 20.",
                "interestRate": "4.0%",
                "minInvestment": "Rs. 20",
                "tenure": "No lock-in",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
            {
                "title": "1-Year Time Deposit",
                "description": "Fixed deposit for 1 year with quarterly compounding.",
                "interestRate": "6.9%",
                "minInvestment": "Rs. 1,000",
                "tenure": "1 year",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
            {
                "title": "2-Year Time Deposit",
                "description": "Fixed deposit for 2 years with quarterly compounding.",
                "interestRate": "7.0%",
                "minInvestment": "Rs. 1,000",
                "tenure": "2 years",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
            {
                "title": "3-Year Time Deposit",
                "description": "Fixed deposit for 3 years with quarterly compounding.",
                "interestRate": "7.1%",
                "minInvestment": "Rs. 1,000",
                "tenure": "3 years",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
            {
                "title": "5-Year Time Deposit",
                "description": "Fixed deposit for 5 years. Eligible for Section 80C tax benefits.",
                "interestRate": "7.5%",
                "minInvestment": "Rs. 1,000",
                "tenure": "5 years",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
        ],
        "Monthly Income Schemes": [
            {
                "title": "Monthly Income Scheme (MIS)",
                "description": "Earn monthly interest on your investment. Max deposit Rs. 9L (individual).",
                "interestRate": "7.4%",
                "minInvestment": "Rs. 1,000",
                "tenure": "5 years",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
        ],
        "Recurring Deposits": [
            {
                "title": "Recurring Deposit (RD)",
                "description": "Save a fixed amount every month for 5 years. Min Rs. 100/month.",
                "interestRate": "6.7%",
                "minInvestment": "Rs. 100/month",
                "tenure": "5 years",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
        ],
        "Senior Citizens Schemes": [
            {
                "title": "Senior Citizens Savings Scheme (SCSS)",
                "description": "For citizens aged 60+. Max deposit Rs. 30 lakh. Quarterly payouts.",
                "interestRate": "8.2%",
                "minInvestment": "Rs. 1,000",
                "tenure": "5 years (extendable by 3)",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
        ],
        "Other Schemes": [
            {
                "title": "Public Provident Fund (PPF)",
                "description": "Long-term savings with Section 80C tax benefits. 15-year lock-in.",
                "interestRate": "7.1%",
                "minInvestment": "Rs. 500/year",
                "tenure": "15 years",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
            {
                "title": "Sukanya Samriddhi Yojana (SSY)",
                "description": "Savings scheme for girl child below 10 years. Tax-free returns.",
                "interestRate": "8.2%",
                "minInvestment": "Rs. 250/year",
                "tenure": "21 years",
                "link": "https://www.indiapost.gov.in/banking-services/savings",
            },
        ],
    }


# ---------------------------------------------------------------------------
# Gold Prices — Economic Times (updated URL and selectors)
# ---------------------------------------------------------------------------

def scrape_gold_prices() -> dict:
    """Scrape gold price data from Economic Times."""
    url = "https://economictimes.indiatimes.com/markets/gold-rate-in-india-today"
    response = requests.get(url, headers=_USER_AGENT, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Find the 30-day history table (Date, 22 Carat Price, 24 Carat Price)
    tables = soup.find_all("table")
    historical_data: list[dict] = []

    for table in tables:
        rows = table.find_all("tr")
        if len(rows) < 5:
            continue
        header_cells = rows[0].find_all(["th", "td"])
        headers = [c.get_text(strip=True) for c in header_cells]
        if "Date" in headers and "22 Carat Price" in headers:
            for row in rows[1:]:
                cells = row.find_all(["th", "td"])
                if len(cells) >= 3:
                    historical_data.append({
                        "date": cells[0].get_text(strip=True),
                        "price_22k": cells[1].get_text(strip=True),
                        "price_24k": cells[2].get_text(strip=True),
                        "timestamp": now,
                    })
            break

    return {
        "categories": {
            "Current Prices": historical_data[:1] if historical_data else [],
            "Historical Prices": historical_data[1:30],
        }
    }


# ---------------------------------------------------------------------------
# Gold Rates — Economic Times (city-wise, updated URL)
# ---------------------------------------------------------------------------

def scrape_gold_rates() -> list[dict]:
    """Scrape city-wise gold rates from Economic Times."""
    url = "https://economictimes.indiatimes.com/markets/gold-rate-in-india-today"
    response = requests.get(url, headers=_USER_AGENT, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Find the city-wise table (117+ rows)
    tables = soup.find_all("table")
    for table in tables:
        rows = table.find_all("tr")
        if len(rows) < 20:
            continue
        header_cells = rows[0].find_all(["th", "td"])
        headers = [c.get_text(strip=True) for c in header_cells]
        if any("Standard Gold" in h or "Pure Gold" in h for h in headers):
            gold_rates: list[dict] = []
            for row in rows[2:]:  # Skip two header rows
                cells = row.find_all(["th", "td"])
                if len(cells) < 5:
                    continue
                city = cells[0].get_text(strip=True).replace("Gold Rate in ", "")
                if not city:
                    continue
                gold_rates.append({
                    "city": city,
                    "gold_22k_1g": cells[1].get_text(strip=True),
                    "gold_22k_8g": cells[2].get_text(strip=True),
                    "gold_24k_1g": cells[3].get_text(strip=True),
                    "gold_24k_8g": cells[4].get_text(strip=True),
                })
            return gold_rates

    return []
