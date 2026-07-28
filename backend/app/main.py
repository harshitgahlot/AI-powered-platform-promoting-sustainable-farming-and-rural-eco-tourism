import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models.base import Base
from app import models  # Ensure all models are registered with Base metadata
from app.api.v1 import auth, users, farms, homestays, marketplace, bookings, ai, analytics, reviews
from app.db_seed import seed_database

# Create database tables automatically on startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[DATABASE WARNING] Could not connect to database host to create tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware for React Vite app communication
# NOTE: allow_origins=["*"] with allow_credentials=True is INVALID per CORS spec.
# Browsers will reject responses. Explicit origins are required when credentials are used.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternate dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://ai-powered-platform-promoting.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists and mount it
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/api/v1/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(farms.router, prefix=f"{settings.API_V1_STR}/farms", tags=["farms"])
app.include_router(homestays.router, prefix=f"{settings.API_V1_STR}/homestays", tags=["homestays"])
app.include_router(marketplace.router, prefix=f"{settings.API_V1_STR}/marketplace", tags=["marketplace"])
app.include_router(bookings.router, prefix=f"{settings.API_V1_STR}/bookings", tags=["bookings"])
app.include_router(reviews.router, prefix=f"{settings.API_V1_STR}/reviews", tags=["reviews"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])

@app.on_event("startup")
def startup_db_seed():
    try:
        db = SessionLocal()
        try:
            # Seeds sample users, profiles, products, rooms, and bookings if empty
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        print(f"[DATABASE WARNING] Could not seed database: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to RuralConnect AI Platform API", "docs": "/docs"}
