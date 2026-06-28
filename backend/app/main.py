import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models.base import Base
from app.api.v1 import auth, users, farms, homestays, marketplace, bookings, ai, analytics, reviews
from app.db_seed import seed_database

#. Create database tables automatically on startup (helpful for quick SQLite testing and initial PG runs)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware for React Vite app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production security, allow all for Docker network simplicity
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
    db = SessionLocal()
    try:
        # Seeds sample users, profiles, products, rooms, and bookings if empty
        seed_database(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to RuralConnect AI Platform API", "docs": "/docs"}
