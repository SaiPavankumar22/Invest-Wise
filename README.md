# InvestWise 💰

An AI-powered investment advisory platform that combines modern web technologies with financial intelligence to help users make informed investment decisions.

## 🌟 Features

### Frontend (React + TypeScript)
- **Investment Advisor** — AI-driven personalized investment recommendations based on user profile
- **Financial Document Analysis** — Upload and analyze financial documents (PDF, images) using OCR + AI
- **Mutual Fund Explorer** — Browse and explore mutual fund options from ET Money
- **LIC Policy Explorer** — Explore LIC insurance policies across categories
- **Post Office Schemes** — Browse Indian Post Office savings schemes
- **Gold Rate Tracker** — Real-time gold price tracking and historical data
- **Video Guides** — Educational investment video content via YouTube integration
- **Financial ChatBot** — AI-powered chatbot for financial queries
- **Community Forum** — Social features for investment discussions and sharing
- **Dark Mode** — Full theme support with dark/light mode toggle
- **Saved Schemes** — Save and track favorite investment schemes

### Backend (Python + Flask)
- **Nebius AI (Gemma 2 27B)** — LLM-powered financial advice and document analysis
- **YouTube API** — Fetch investment-related educational videos
- **Web Scraping** — Real-time data from ET Money, LIC India, India Post, and gold price sources
- **OCR Processing** — Extract text from PDFs and images using Tesseract
- **File Upload** — Secure file handling for document analysis

## 📁 Project Structure

```
investwise/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level page components
│   │   ├── contexts/          # React Context providers
│   │   ├── types/             # TypeScript type definitions
│   │   ├── Community/         # Community feature module
│   │   │   ├── components/    # Community-specific components
│   │   │   ├── pages/         # Community pages
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # API services
│   │   │   └── utils/         # Utility functions
│   │   ├── App.tsx            # Main app with routing
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── eslint.config.js       # ESLint configuration
│
├── backend/                   # Python Flask backend
│   ├── app.py                 # Flask routes (thin layer)
│   ├── services/              # Business logic modules
│   │   ├── llm_service.py     # Nebius AI (Gemma 2 27B) integration
│   │   ├── youtube_service.py # YouTube Data API
│   │   ├── investment_service.py # Investment recommendations
│   │   ├── scraper_service.py # Web scraping (MFs, LIC, Post Office, Gold)
│   │   └── document_service.py # OCR + LLM document analysis
│   ├── requirements.txt       # Python dependencies
│   ├── uploads/               # File upload directory
│   └── .env.example           # Environment variables template
│
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Tesseract OCR (for document analysis)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the server
python app.py
```

The backend will be available at `http://localhost:5000`

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Nebius AI Studio API Key (required — https://studio.nebius.ai)
NEBIUS_API_KEY=your_nebius_api_key_here

# YouTube Data API Key
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_BASE_URL=https://www.googleapis.com/youtube/v3
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | Radix UI, Framer Motion, Recharts |
| State Management | React Query, React Context |
| Backend | Python, Flask, Flask-CORS |
| AI/ML | Nebius AI Studio (Google Gemma 2 27B IT) via OpenAI SDK |
| OCR | Tesseract, PyMuPDF, Pillow |
| Data Sources | YouTube API, Web Scraping (ET Money, LIC, India Post) |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ask` | Get AI financial advice |
| POST | `/get_videos` | Fetch YouTube videos |
| POST | `/get_investment_options` | Get investment recommendations |
| GET | `/get-mutual-funds` | Scrape mutual fund data |
| GET | `/lic_policies` | Fetch LIC policies |
| GET | `/post_office_policies` | Fetch Post Office schemes |
| GET | `/gold_prices` | Get gold price data |
| GET | `/get_gold_rates` | Scrape gold rates by city |
| POST | `/upload_file` | Upload & analyze financial documents |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for smarter financial decisions
