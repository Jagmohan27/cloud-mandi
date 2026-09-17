# Cloud Mandi

> **Production-grade cloud platform and API for Indian agricultural wholesale market prices (दैनिक मंडी भाव).**

Collects wholesale mandi price data from the official Government of India open data portal (**data.gov.in / AGMARKNET**), validates and cleans records, stores them in PostgreSQL with strict deduplication, and exposes a high-performance REST API accompanied by an Apple-inspired monochrome dashboard.

---

## Architecture

```mermaid
flowchart TD
    subgraph Data Source
        GOV[data.gov.in AGMARKNET API<br/>Resource ID: 9ef84268-d588...]
    end

    subgraph Mandi Price Cloud Backend
        SCHED[APScheduler Background Job<br/>Every 6 Hours] -->|Fetch Records| ING[Ingestion Service Client]
        ING --> PROC[Data Processor & Validator<br/>Sanitizes Dates & Prices]
        PROC --> DEDUP[Deduplication Engine<br/>Unique Constraint Checks]
        DEDUP --> DB[(PostgreSQL Cloud Database<br/>B-Tree Indexes)]
        DB --> ORM[SQLAlchemy 2.0 ORM]
        ORM --> API[FastAPI REST Engine]
        API --> DOCS[Swagger & ReDoc Documentation]
    end

    subgraph Client Application
        API -->|JSON REST Responses| FE[React 19 + Vite Dashboard]
        FE --> EXP[Price Explorer & Multi-Filters]
        FE --> TRN[Price Trend Visualizer - Recharts]
        FE --> ADM[Admin Control & Ingestion Trigger]
        FE --> DEV[API Developer Portal]
    end

    GOV --> ING
```

---

## Features

- **Official Government Data Ingestion**: Live integration with Government of India's `data.gov.in` AGMARKNET dataset (`resource/9ef84268-d588-465a-a308-a864a43d0070`).
- **Resilient Cleaning & Deduplication**: Cleans dates, normalizes names to title-case, converts dirty price strings to numeric floats, and prevents duplicates using unique composite keys `(commodity_id, mandi_id, variety, price_date)`.
- **Scheduled Background Sync**: Automatic ingestion every 6 hours via APScheduler with runtime telemetry and audit logging (`sync_logs`).
- **High-Performance REST API**: Endpoints for prices, latest snapshots, historical lookbacks (7d/30d/90d/1y), commodities, states, districts, mandis, and platform statistics.
- **Apple-Inspired Monochrome UI**: Minimalist aesthetic with generous whitespace, SF/Inter typography, frosted glass headers, and subtle micro-interactions.
- **Interactive Price Explorer**: Instant debounced search and filtering by State, District, Mandi, Commodity, Variety, and Date with pagination.
- **Time-Series Charts**: Recharts monochrome trends displaying modal rates, minimum and maximum ranges, and period net percentage changes.
- **Admin Control Plane**: JWT-authenticated management dashboard displaying pipeline health, audit logs, and on-demand `[Sync Now]` trigger.
- **Interactive API Documentation**: Live Swagger UI at `/api/docs`, ReDoc at `/api/redoc`, and copy-pasteable code examples in cURL, JavaScript, and Python.
- **Cloud Deployable**: Containerized with Docker and Docker Compose, ready for single-click deployment on Render, Railway, or AWS ECS.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend API** | Python 3.11+, FastAPI, Pydantic v2, Pydantic Settings |
| **Database & ORM** | PostgreSQL 16, SQLAlchemy 2.0, Alembic |
| **Scheduler & Ingestion** | APScheduler, HTTPX Async, Datetime parsing engine |
| **Security & Auth** | JWT (python-jose), Bcrypt password hashing |
| **Frontend UI** | React 19, Vite, Tailwind CSS v4, Framer Motion |
| **Charts & Icons** | Recharts (Monochrome time-series), Lucide React |
| **Testing** | Pytest, Pytest-Asyncio, Starlette TestClient |
| **Containers** | Docker, Docker Compose, Nginx Alpine |

---

## Database Schema

```mermaid
erDiagram
    COMMODITY ||--o{ MANDI_PRICE : "has prices"
    MANDI ||--o{ MANDI_PRICE : "reports prices"
    
    COMMODITY {
        int id PK
        string name UK "Indexed"
        string category
        datetime created_at
    }

    MANDI {
        int id PK
        string name "Indexed"
        string state "Indexed"
        string district "Indexed"
        datetime created_at
    }

    MANDI_PRICE {
        int id PK
        int commodity_id FK
        int mandi_id FK
        string variety "Indexed"
        string grade
        float minimum_price
        float maximum_price
        float modal_price "Indexed"
        date price_date "Indexed"
        string source
        datetime created_at
        datetime updated_at
    }

    SYNC_LOG {
        int id PK
        string status "SUCCESS / FAILED / RUNNING"
        int records_fetched
        int records_inserted
        int records_updated
        int records_rejected
        string source
        text error_message
        datetime started_at
        datetime completed_at
    }

    ADMIN_USER {
        int id PK
        string username UK
        string hashed_password
        boolean is_active
        datetime created_at
    }
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `postgresql://user:password@localhost:5432/mandi_price_cloud` |
| `DATA_GOV_API_KEY` | data.gov.in registered API Key | Public default pre-configured in `.env` |
| `DATA_GOV_RESOURCE_ID` | AGMARKNET resource UUID | `9ef84268-d588-465a-a308-a864a43d0070` |
| `JWT_SECRET` | Secret key used to sign Admin JWT tokens | Random string (min 32 chars) |
| `ADMIN_USERNAME` | Administrator login username | `admin` |
| `ADMIN_PASSWORD` | Administrator login password | `adminpassword` |
| `SYNC_INTERVAL_HOURS` | Background job frequency in hours | `6` |
| `ENABLE_SCHEDULER` | Toggle background scheduled jobs | `true` |
| `CORS_ORIGINS` | Permitted origins for frontend CORS | `["http://localhost:5173", "http://localhost:3000"]` |

---

## Running Locally

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server with hot-reload
uvicorn app.main:app --reload --port 8000
```

Backend will be live at:
- **API Base**: [http://localhost:8000/api](http://localhost:8000/api)
- **Swagger Documentation**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Frontend Setup

```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```

Frontend will be live at [http://localhost:5173](http://localhost:5173).

---

## Running with Docker Compose

To launch the full stack (PostgreSQL + FastAPI Backend + React/Nginx Frontend):

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend & Swagger: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## Automated Testing

Run the automated test suite with pytest:

```bash
cd backend
venv/bin/pytest tests/ -v
```

Test coverage includes:
- Health check verification
- Price filtering, sorting, and pagination
- Historical time-series calculation
- Metadata extraction (commodities, states, districts, mandis)
- Deduplication and data normalization
- Admin authentication and unauthorized access protection

---

## REST API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Healthcheck returning DB connection and scheduler status |
| `/api/prices` | `GET` | Paginated search with multi-attribute filters |
| `/api/prices/{id}` | `GET` | Single price detail |
| `/api/prices/latest` | `GET` | Most recent prices across commodities |
| `/api/prices/history` | `GET` | Time-series data points for charts (7d, 30d, 90d, 1y) |
| `/api/commodities` | `GET` | Distinct commodity list with record counts |
| `/api/states` | `GET` | States covered by reported markets |
| `/api/districts` | `GET` | Filter districts by state |
| `/api/mandis` | `GET` | Filter mandis/markets by state and district |
| `/api/statistics` | `GET` | Real aggregated statistics & coverage |
| `/api/admin/login` | `POST` | Admin authentication returning JWT bearer token |
| `/api/admin/sync` | `POST` | Trigger manual data ingestion from data.gov.in |
| `/api/admin/sync-status`| `GET` | Telemetry of active and historical sync jobs |

---

## Cloud Deployment Guide

### Deploying to Render
1. Create a **PostgreSQL** instance on Render and copy the Internal Connection String into `DATABASE_URL`.
2. Create a **Web Service** for the backend:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Set environment variables (`DATABASE_URL`, `DATA_GOV_API_KEY`, `JWT_SECRET`, etc.).
3. Create a **Static Site** for the frontend:
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Set `VITE_API_BASE_URL` to your backend Render URL.

### Deploying to Railway
1. Click **New Project** -> **Deploy from GitHub repo**.
2. Add a **PostgreSQL** database service; Railway automatically populates `DATABASE_URL`.
3. Railway auto-detects `Dockerfile` in `backend` and `frontend` folders.

---

## Future Improvements

- **Farmer SMS & WhatsApp Price Alerts** based on APMC threshold triggers.
- **AI-based Seasonal Price Forecasting** using historical year-over-year moving averages.
- **Multi-language Support** (Hindi, Punjabi, Marathi, Bengali, Telugu, Tamil).
- **Proximity Geo-Discovery** locating nearest active mandis via browser GPS coordinates.
- **Arrival Volume Analytics** correlating price spikes with supply arrivals.

---

## License

MIT License. Designed and built for Indian agricultural transparency.
