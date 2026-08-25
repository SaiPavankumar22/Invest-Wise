# InvestWise — AI-Powered Investment Advisory Platform

> Make smarter investment decisions with AI-powered recommendations, real-time market data, and expert financial guidance.

## 🏗️ Architecture

```
investwise/
├── frontend/           # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/ # Navbar, Footer, ChatBot, Login, SignUp, etc.
│   │   ├── pages/      # Home (Landing), Advisor, Videos, etc.
│   │   ├── contexts/   # ThemeContext, SavedSchemesContext
│   │   ├── types/      # TypeScript type definitions
│   │   └── lib/        # Utilities
│   └── ...
├── backend/            # Python Flask + MongoDB
│   ├── app.py          # Flask routes (auth + financial APIs)
│   ├── services/       # Modular service layer
│   │   ├── llm_service.py          # Nebius AI (Gemma 3 27B-IT)
│   │   ├── youtube_service.py      # YouTube Data API
│   │   ├── investment_service.py   # Rule-based recommendations
│   │   ├── scraper_service.py      # Web scraping (ET, LIC, etc.)
│   │   └── document_service.py     # OCR + LLM document analysis
│   ├── uploads/        # User-uploaded financial documents
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (running on localhost:27017)

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
# Nebius AI Studio (Gemma 3 27B-IT)
NEBIUS_API_KEY=your_key

# YouTube Data API (optional)
YOUTUBE_API_KEY=your_key

# MongoDB (default localhost:27017)
MONGO_URI=mongodb://localhost:27017

# JWT Secret (change in production!)
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
| POST | `/upload_file` | Upload & analyze financial documents |

## 🎯 Features

### 🏠 Landing Page
- Hero section with animated background
- Stats counter, how-it-works steps
- Feature cards with gradient icons
- Investment scheme explorer with save/favorite
- Testimonials and CTA sections

### 🤖 AI Financial Advisor
- Chat with AI about investment queries
- Powered by Nebius AI (Gemma 3 27B-IT)
- Real-time responses for financial guidance

### 📊 Investment Recommendations
- Rule-based engine matching age, risk, horizon, budget
- 14+ investment schemes across fixed and recurring categories

### 📄 Document Analyzer
- Upload PDFs, images, or text files
- OCR for scanned documents
- AI-powered analysis and summarization

### 📈 Live Market Data
- Gold rates scraped from Economic Times
- Mutual fund data from ET Money
- LIC policy information from LIC India
- Post office saving scheme details

### 🔐 Authentication
- MongoDB-backed user storage
- bcrypt password hashing
- JWT token authentication (72-hour expiry)
- Profile management

### 💬 AI Chatbot
- Floating chatbot widget on all pages
- Real-time AI responses for investment queries

### 🎨 UI/UX
- Dark/Light theme toggle
- Fully responsive design
- Tailwind CSS with custom animations
- Glass morphism effects and gradients

## 📦 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- Lucide Icons
- Framer Motion
- Recharts (charts)

**Backend:**
- Python Flask
- MongoDB (pymongo)
- bcrypt + PyJWT (auth)
- OpenAI SDK → Nebius AI Studio
- BeautifulSoup4 (web scraping)
- PyMuPDF + Tesseract (OCR)

## ⚠️ Disclaimer

Investment in financial instruments involves risks. Please read all scheme-related documents carefully before investing. This platform is for educational and informational purposes only.
