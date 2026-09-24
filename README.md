# Cloud Mandi

A modern full-stack agricultural market intelligence platform and REST API powered by official Government of India open data (**AGMARKNET / data.gov.in**).

Designed to be simple, fast, farmer-friendly, and production-ready for Indian farmers, traders, and agricultural cooperatives.

---

## Key Features Built & Working

- **Official Government Data Ingestion**:
  - Connects to the Ministry of Agriculture's AGMARKNET API on `data.gov.in` (`resource/9ef84268-d588-465a-a308-a864a43d0070`).
  - Automatically cleans dates, normalizes crop/mandi names, and converts prices into standardized integers.
  - Automatically avoids duplicates in PostgreSQL via a unique constraint on `(commodity, mandi, variety, date)`.
  - Runs in the background on APScheduler every 6 hours and logs all sync results.

- **Today's Mandi Rates (दैनिक मंडी भाव)**:
  - Search and filter by Crop, State, District, Mandi, and Date.
  - Prices displayed in **₹ per Quintal (100 kg)**.
  - Shows Lowest Rate (न्यूनतम), Today's Market Rate (बाजार भाव), and Highest Rate (अधिकतम).
  - 1-tap quick buttons for popular crops (*Wheat, Paddy, Onion, Potato, Tomato, Cotton, Soyabean, Mustard*).

- **Personal Crop Watchlist (पसंदीदा फसलें)**:
  - 1-click star icon (⭐) next to any crop row or detail view to pin it to your personal watchlist.
  - Persisted in browser `localStorage` with a dedicated "⭐ My Watchlist" filter tab.

- **Speech Recognition Voice Search (बोलकर खोजें)**:
  - Integrated Web Speech API with an active microphone button.
  - Speak crop or market names in Hindi or English (e.g., *"गेहूं"*, *"Sarson"*, *"आजादपुर"*) for hands-free search.

- **Market Pulse: Top Movers vs Govt MSP (आज के बड़े उतार-चढ़ाव)**:
  - Real-time intelligence widget highlighting which crops have the highest market premiums above MSP.
  - Alerts farmers when market prices are trading near or below government support floors.

- **Regional Harvest Unit Converter (क्विंटल, मन, बोरी, किलो)**:
  - Toggle price units between **Quintal (100kg)**, **Maund / Man (40kg)**, **Bori / Bag (50kg)**, and **Kilogram (1kg)**.
  - Integrated directly into the Profit Calculator and Mandi comparison cards.

- **Official Minimum Support Price (MSP) Comparison (न्यूनतम समर्थन मूल्य)**:
  - Compares market prices against official Government of India benchmark MSP rates.
  - Displays instant `+X% Above MSP` (green) or `-X% Below MSP` (amber) indicators.

- **MSP-Aware WhatsApp & SMS Rate Cards**:
  - 1-tap **WhatsApp** button and **Copy Text** button to generate preformatted Hindi/English rate cards for village farmer groups.

- **Geolocation Nearest APMC Discovery (नजदीकी मंडी खोजें)**:
  - 1-tap "Find Mandis Near Me" button using browser geolocation and the Haversine formula.
  - Displays distance badges (`📍 ~18 km`) on market cards and sorts nearest APMCs automatically.

- **Recent Search History**:
  - Automatically saves recent crop, mandi, and district searches to browser local storage.
  - Displays quick clickable chips for immediate repeat queries.

- **Print-Optimized Rate Sheets & PDF Export**:
  - 1-click **Print / PDF** button with dedicated `@media print` layout.
  - Clean A4 printable sheet for panchayat offices, notice boards, and offline distribution.

- **Compare Mandis & Profit Calculator (भाव तुलना व कमाई कैलकुलेटर)**:
  - Compare prices across nearby mandis side-by-side.
  - Automatically highlights the **#1 Highest Price Mandi** and shows the price difference per quintal.
  - **Quantity Profit Calculator**: Calculate total extra money earned based on your harvest volume.

- **Bilingual English & Hindi Mode (हिन्दी / English)**:
  - 1-click language switcher with persistent memory across sessions.
  - Farmer-friendly terminology (*बाजार भाव, न्यूनतम, अधिकतम, प्रति क्विंटल*).

- **Dark & Light Mode Theme Switcher**:
  - Apple-style Sun/Moon theme toggle with local storage persistence and system preference detection.

- **PWA Mobile App & Offline Rate Caching**:
  - Installable directly to mobile home screens like a native app.
  - Automatically caches the latest price sheet in `localStorage` for offline review when network is spotty.

- **Price Trends (भाव ट्रेंड)**:
  - Interactive charts showing price movement over **7 Days**, **30 Days**, **90 Days**, and **1 Year**.

- **CSV Export**:
  - 1-click **CSV** button to save current price sheets for spreadsheet analysis.

- **Admin Sync Control & Health Telemetry**:
  - Secure Admin section with a **`[Sync Now]`** button to trigger live data fetching from `data.gov.in`.
  - `/api/health` endpoint returning database health, active price records count, and last sync timestamp.

- **Automated CI/CD Pipeline**:
  - GitHub Actions workflow (`.github/workflows/ci.yml`) automatically runs pytest suite and Vite production build on every push and pull request.

---

## Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Framer Motion, Lucide Icons, Web Speech API |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| **Database** | PostgreSQL (with SQLite fallback) |
| **Scheduler** | APScheduler |
| **CI / CD** | GitHub Actions |
| **Data Source** | data.gov.in AGMARKNET Dataset |

---

## Project Structure

```
cloud-mandi/
├── .github/
│   └── workflows/ci.yml       # GitHub Actions CI workflow
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # Prices, metadata, statistics, health, admin
│   │   ├── core/config.py     # Environment settings
│   │   ├── database/          # DB session & initial seeder
│   │   ├── ingestion/         # data.gov.in API client, processor, scheduler
│   │   ├── models/            # SQLAlchemy database tables
│   │   ├── schemas/           # Pydantic validation schemas
│   │   └── main.py            # FastAPI entry point
│   ├── tests/test_api.py      # Automated tests
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, PriceDetailModal
│   │   ├── pages/             # Landing, PriceExplorer, CompareMandis, Trends, Markets
│   │   ├── utils/             # geoData, mspData, share
│   │   ├── services/api.js    # API service client
│   │   └── App.jsx            # Main app & routing
│   ├── package.json
│   └── vite.config.js
│
├── .env                       # Environment variables
├── docker-compose.yml         # Container setup
└── README.md
```

---

## How to Run Locally

### 1. Start the Backend
```bash
cd backend
source venv/bin/activate       # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000/api`
- Swagger Docs: `http://localhost:8000/api/docs`
- Health Check: `http://localhost:8000/api/health`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Dashboard: `http://localhost:5173`

### 3. Run with Docker (Optional)
```bash
docker-compose up --build
```

---

## Testing

Run the automated backend test suite:
```bash
cd backend
venv/bin/pytest tests/ -v
```
All 9 test cases pass (testing health, price queries, filtering, history calculations, deduplication, and authentication).
