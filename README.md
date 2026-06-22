# RuralConnect AI – Sustainable Farming & Eco-Tourism platform

**RuralConnect AI** is a complete, production-grade full-stack digital ecosystem that combines organic agriculture services, rural homestay lodging bookings, a farm-to-table marketplace, and AI-powered analytics. It provides rural communities with tools to scale their income through eco-tourism and marketplace sales.

---

## Technical Architecture

The platform uses a strict **Clean Layered Architecture** design:

```
API Layer (endpoints, route validation via Pydantic v2)
    ↓
Service Layer (business logic, validations, AI engine)
    ↓
Repository Layer (clean database queries via SQLAlchemy 2.0)
    ↓
Database Layer (SQLAlchemy 2.0 / PostgreSQL)
```

### Stack Components

* **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2.0 (Mapped classes), Alembic, Pydantic v2 (ConfigDict).
* **Database**: PostgreSQL (persisted volumes inside Docker), with SQLite fallback for direct local runs.
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v3, React Router v6, Axios, Recharts (responsive analytics).
* **AI Modules**: Scikit-Learn, Pandas, NumPy (TF-IDF chatbot, cosine similarity recommendations, Ridge forecasting, and Logistic Regression sentiment classifier).
* **Docker Deployment**: PostgreSQL, FastAPI (Uvicorn), and Multi-stage React build served through Nginx.

---

## Repository Structure

```
c:\Users\Asmit Bhandari\Desktop\pojects\harshit ai\
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Route handlers (calls services)
│   │   ├── core/            # Config, security, database session setup
│   │   ├── models/          # SQLAlchemy 2.0 model files
│   │   ├── repositories/    # CRUD query operations
│   │   ├── schemas/         # Pydantic validation files
│   │   ├── services/        # Business logic & AI algorithms
│   │   ├── db_seed.py       # Seeds rich initial mock data
│   │   └── main.py          # FastAPI application entrypoint
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # UI buttons, modals, floating chatbot, Recharts
│   │   ├── context/         # Auth, Theme (dark mode), Cart contexts
│   │   ├── hooks/           # custom useToast hook
│   │   ├── pages/           # Dashboards and listings pages
│   │   ├── services/        # Axios API clients
│   │   └── App.tsx          # Router configuration
│   ├── Dockerfile
│   └── tailwind.config.js
├── nginx/
│   └── default.conf         # Proxy config routing /api to FastAPI
├── docker-compose.yml       # Orchestrates the containers
└── README.md
```

---

## Single-Command Docker Deployment (Recommended)

To compile the React TypeScript client and spin up PostgreSQL, the FastAPI backend, and the Nginx server altogether, execute:

```bash
docker-compose up --build
```

1. **Frontend App**: Accessible at `http://localhost` (Port 80).
2. **API Documentation**: Accessible at `http://localhost/docs` or `http://localhost:8000/docs`.
3. **Database Port**: Bound locally to `5432` if you want to inspect via GUI tools.

---

## Local Development Setup

If running without Docker, follow these steps:

### 1. Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *Note: On boot, the server will automatically create a local SQLite database (`ruralconnect.db`) and seed it with mock users, listings, products, reviews, and metrics.*

### 2. Frontend Setup

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

---

## Seeding & Test Credentials

The database will be automatically seeded at startup with the following test credentials:

| Role | Username / Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Tourist** | `tourist@ruralconnect.com` | `tourist123` | Browse listings, place orders, book stays/visits, submit reviews. |
| **Farmer** | `farmer@ruralconnect.com` | `farmer123` | Farm profile settings, edit products catalog, review tour reservations. |
| **Homestay Owner** | `owner@ruralconnect.com` | `owner123` | Configure lodgings, add rooms, review guest check-ins. |
| **Admin** | `admin@ruralconnect.com` | `admin123` | Oversight, users suspension control, listings approvals, analytics. |

---

## Core Features

1. **Role-Based Dashboards**: Customized landing panels for Tourist activities, Farmer inventory logs, Homestay calendars, and Admin audits.
2. **PostgreSQL-Stored Shopping Carts**: Cart states synchronize with the database, allowing users to leave and resume checkouts across devices.
3. **AI Semantic Chatbot**: Uses Cosine Similarity on TF-IDF vectors to answer organic farming and travel FAQs.
4. **Demand Forecasting**: Runs a Ridge Regression model to predict upcoming sales metrics and booking frequencies.
5. **Review Sentiment Scoring**: Processes review text using a Logistic Regression model to score satisfaction from `-1.0` (negative) to `1.0` (positive).
