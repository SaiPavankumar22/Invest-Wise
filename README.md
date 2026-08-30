# InvestWise — AI-Powered Investment Advisory Platform

> Make smarter financial decisions with AI-powered budget analysis, investment recommendations, real-time market data, and expert financial guidance.

## 🏗️ Architecture

```
investwise/
├── frontend/                    # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/          # Navbar, Footer, ChatBot, Login, SignUp, etc.
│   │   ├── pages/               # Home, Dashboard, FinanceCoach, AgentPages (6 agents), Advisor, etc.
│   │   ├── contexts/            # AuthContext, ThemeContext, SavedSchemesContext
│   │   ├── types/               # TypeScript type definitions
│   │   └── lib/                 # Utilities (cn helper)
│   └── ...
├── backend/                     # Python Flask + MongoDB
│   ├── app.py                   # Flask routes (auth + financial APIs)
│   ├── services/                # Modular service layer
│   │   ├── nebius_config.py             # Agno + LangChain shared config (Nebius)
│   │   ├── llm_service.py               # Nebius AI (Gemma 3 27B-IT)
│   │   ├── finance_coach_service.py     # Multi-agent financial analysis
│   │   ├── tax_planning_service.py      # Tax Planning Agent (Agno)
│   │   ├── retirement_calculator_service.py  # Retirement Calculator Agent (Agno)
│   │   ├── emi_calculator_service.py    # EMI & Loan Comparison Agent (Agno)
│   │   ├── insurance_advisor_service.py # Insurance Advisor Agent (Agno)
│   │   ├── goal_planner_service.py      # Goal-Based Planner Agent (Agno)
│   │   ├── credit_score_service.py      # Credit Score Agent (Agno)
│   │   ├── youtube_service.py           # YouTube Data API
│   │   ├── investment_service.py        # Rule-based recommendations
│   │   ├── scraper_service.py           # Web scraping (ET, LIC, etc.)
│   │   └── document_service.py          # OCR + LLM document analysis
│   ├── uploads/                 # User-uploaded files + sample data
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (running on `localhost:27017`)

### Frontend
```bash
cd frontend
npm install
npm run dev       # → http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python app.py     # → http://localhost:5000
```

## 🔑 Environment Variables

Create `backend/.env`:
```env
# Nebius AI Studio (Gemma 3 27B-IT) — required for AI features
NEBIUS_API_KEY=your_key

# YouTube Data API — optional, for video guides
YOUTUBE_API_KEY=your_key

# MongoDB (default: localhost:27017)
MONGO_URI=mongodb://localhost:27017

# JWT Secret — change in production!
JWT_SECRET=your-random-secret
```

## 🛠️ API Endpoints

### Authentication (MongoDB)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create account (username, email, password) |
| POST | `/login` | Login → returns JWT token |
| GET | `/profile` | Get user profile (requires Bearer token) |
| PUT | `/profile` | Update user profile |

### AI Financial Coach
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze-finances` | Multi-agent analysis: budget, savings, debt reduction |

### Agno AI Agents (6 new agents using Agno + LangChain + Nebius)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tax-planning` | Old vs new tax regime comparison, deduction suggestions |
| POST | `/retirement-calculator` | Corpus projection, gap analysis, SIP top-up recommendations |
| POST | `/emi-comparison` | Compare EMIs across 5+ banks, prepayment analysis |
| POST | `/insurance-advisor` | Life/health/term insurance recommendations, gap analysis |
| POST | `/goal-planner` | Goal-based SIP planning with prioritization |
| POST | `/credit-score` | CIBIL score analysis, factor breakdown, improvement plan |

**Agent technology stack:**
- **Agno** — Agent orchestration (Agent class, model routing, tool execution)
- **LangChain** — Prompt templates (ChatPromptTemplate) and structured output parsing
- **Nebius AI** — LLM backend (Gemma 3 27B-IT via OpenAI-compatible API)
- **Fallback** — Each agent gracefully falls back to direct LLM calls if Agno fails

### Financial Advisor (LLM)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ask` | Ask AI financial advisor |
| POST | `/get_videos` | Get YouTube video suggestions |
| POST | `/get_investment_options` | Get investment recommendations |

### Market Data (Scrapers)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/get_gold_rates` | City-wise gold rates (Economic Times) |
| GET | `/gold_prices` | 30-day gold price history |
| GET | `/get-mutual-funds` | Featured mutual funds (ET Money) |
| GET | `/lic_policies` | LIC policy details |
| GET | `/post_office_policies` | Post office saving schemes |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload_file` | Upload & analyze financial documents (PDF, images) |

## 🎯 Features

### 🏠 Landing Page (`/`)
- Hero section with animated gradient background and blur orbs
- Stats bar (14+ options, ₹50K+ min, 24/7 AI, 100% secure)
- 4-step "How It Works" onboarding flow
- 6 feature cards with gradient icons
- User testimonials with star ratings
- Conversion CTA section
- Footer with product links (landing page only)

### 🏡 Dashboard (`/home`)
- Welcome header with username
- Quick stats (total schemes, fixed, recurring, saved)
- Search bar with real-time filtering
- Category filter (All / Fixed / Recurring)
- 14+ investment scheme cards in responsive grid
- Save/favorite functionality

### 🧠 AI Financial Coach (`/finance-coach`)
- **3-agent pipeline** powered by Nebius AI (Gemma 3 27B-IT) via Agno + LangChain:
  1. **Budget Analysis Agent** — categorizes expenses, identifies savings patterns
  2. **Savings Strategy Agent** — emergency fund sizing, savings allocations, automation
  3. **Debt Reduction Agent** — avalanche vs snowball payoff plans, interest optimization
- **Input options:**
  - Manual entry (10 expense categories with icons)
  - CSV upload with column auto-detection
  - Excel (.xlsx/.xls) upload via SheetJS
- **Results with charts:**
  - Pie chart (spending breakdown)
  - Bar chart (income vs expenses)
  - Category progress bars with percentages
  - Emergency fund progress tracker
  - Avalanche vs snowball comparison cards
  - Debt breakdown bar chart
- Graceful fallback defaults if LLM calls fail

### 🤖 AI Financial Advisor (`/investments`)
- Questionnaire-based investment recommendation
- Rule-based engine matching age, risk, horizon, budget
- 14+ investment schemes across fixed and recurring categories

### 📊 6 AI Agents (Agno + LangChain + Nebius)

**Tax Planning (`/tax-planning`)**
- Compares old vs new tax regime with accurate slab calculations
- Deduction suggestions (80C, 80D, NPS, HRA, home loan)
- Last-minute tax saving tips
- Indian FY 2024-25 tax slabs

**Retirement Calculator (`/retirement`)**
- Projects corpus with/without inflation (25x rule)
- Yearly breakdown table with compound interest
- Multiple SIP scenarios with top-up recommendations
- Gap analysis vs target corpus

**EMI & Loan Comparison (`/emi-compare`)**
- Compares EMIs across 5+ Indian banks (SBI, HDFC, ICICI, etc.)
- Total interest paid comparison
- Prepayment impact analysis
- Best lender recommendation with savings amount

**Insurance Advisor (`/insurance`)**
- Term life (10-15x income), health, critical illness, accident cover
- Gap analysis: underinsured / adequately insured / overinsured
- Indian market premium estimates
- Tax benefits under 80C and 80D

**Goal-Based Financial Planner (`/goal-planner`)**
- Multiple goals with target amounts and dates
- SIP calculation per goal with instrument recommendations
- Priority ordering (emergency > retirement > house > education)
- Feasibility scoring (easily achievable → needs adjustment)

**Credit Score Improvement (`/credit-score`)**
- CIBIL score factor breakdown with visual bars
- 5 factors: payment history, utilization, age, mix, inquiries
- Immediate / short-term / long-term improvement plan
- Projected score timeline (3/6/12/24 months)

### 📄 Document Analyzer (`/financial-doc-analysis`)
- Upload PDFs, images, or text files
- OCR for scanned documents (PyMuPDF + Tesseract)
- AI-powered financial document analysis

### 📈 Live Market Data
| Feature | Route | Source |
|---------|-------|--------|
| Gold Rates | `/gold` | Economic Times (city-wise) |
| Gold History | `/gold` | Economic Times (30-day) |
| Mutual Funds | `/get-mutual-funds` | ET Money (featured funds) |
| LIC Policies | `/lic-explorer` | LIC India |
| Post Office | `/post-office-explorer` | India Post schemes |

### 🎬 Video Guides (`/video-guides`)
- YouTube video suggestions for investment topics
- Powered by YouTube Data API

### 💡 Expert Advice (`/advice`)
- Financial advice cards and guidance

### 🔐 Authentication
- MongoDB-backed user storage with unique indexes
- bcrypt password hashing (12 rounds)
- JWT token authentication (72-hour expiry)
- Auth-aware Navbar (links hidden when logged out)
- Split-screen Login/SignUp pages with branding panels
- Cookie + localStorage session persistence

### 💬 AI Chatbot
- Floating chatbot widget on all pages
- Real-time AI responses for investment queries

### 🎨 UI/UX
- Dark/Light theme toggle
- Fully responsive design (mobile-first)
- Tailwind CSS with custom animations (fadeInUp, slideIn, float)
- Glass morphism effects and gradient accents
- Custom scrollbar styling
- Smooth page transitions

## 📊 Sample Data

The `backend/uploads/` folder includes sample files for testing the Finance Coach:

| File | Format | Profile |
|------|--------|---------|
| `sample_expenses.csv` | CSV | Single person, ~$2K/mo |
| `sample_expenses_large.csv` | CSV | Professional, ~$4.5K/mo |
| `sample_student_budget.xlsx` | Excel | Student budget |
| `sample_professional_budget.xlsx` | Excel | Mid-career professional |
| `sample_family_high_debt.xlsx` | Excel | Family with high debt |

**CSV format:** `Date,Category,Amount` (Date column is optional — rows with placeholder dates like `xxxx` are handled gracefully)

## 📦 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- Recharts (charts & visualizations)
- Lucide React (icons)
- Framer Motion (animations)
- Radix UI (accessible components)
- Axios (HTTP client)
- xlsx/SheetJS (Excel file parsing)
- js-cookie (session management)

**Backend:**
- Python Flask
- MongoDB (pymongo)
- bcrypt + PyJWT (auth)
- OpenAI SDK → Nebius AI Studio (Gemma 3 27B-IT)
- Agno (agent orchestration framework)
- LangChain (prompt templates + structured output)
- BeautifulSoup4 + lxml (web scraping)
- PyMuPDF + Tesseract + Pillow (OCR)

## 📁 Pages & Routes

| Route | Page | Auth Required |
|-------|------|:---:|
| `/` | Landing Page | No |
| `/login` | Login | No |
| `/signUp` | Sign Up | No |
| `/home` | Dashboard (schemes) | Yes |
| `/finance-coach` | AI Financial Coach | Yes |
| `/investments` | Investment Advisor | Yes |
| `/financial-doc-analysis` | Document Analyzer | Yes |
| `/video-guides` | Video Guides | Yes |
| `/advice` | Expert Advice | Yes |
| `/saved` | Saved Schemes | Yes |
| `/tax-planning` | Tax Planning Agent | Yes |
| `/retirement` | Retirement Calculator | Yes |
| `/emi-compare` | EMI & Loan Comparison | Yes |
| `/insurance` | Insurance Advisor | Yes |
| `/goal-planner` | Goal-Based Planner | Yes |
| `/credit-score` | Credit Score Improvement | Yes |
| `/scheme/:id` | Scheme Details | Yes |
| `/gold` | Gold Rates | Yes |
| `/get-mutual-funds` | Mutual Fund Explorer | Yes |
| `/lic-explorer` | LIC Policy Explorer | Yes |
| `/post-office-explorer` | Post Office Schemes | Yes |

## ⚠️ Disclaimer

Investment in financial instruments involves risks. Please read all scheme-related documents carefully before investing. This platform is for educational and informational purposes only.
