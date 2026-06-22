import os
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "RuralConnect AI"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth Configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET", "8a9f023d8c11e74a62bb1e89c670a442e2b3c4f5a6b7c8d9e0f1a2b3c4d5e6f7")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Database Configuration (Defaults to local SQLite for easy execution, but configures PostgreSQL in Docker)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ruralconnect.db")
    
    # Storage Configuration
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local")  # "local", "cloudinary", "s3"
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
    
    # Cloudinary Credentials
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    # S3 Credentials
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_STORAGE_BUCKET_NAME: str = os.getenv("AWS_STORAGE_BUCKET_NAME", "")
    AWS_S3_REGION_NAME: str = os.getenv("AWS_S3_REGION_NAME", "us-east-1")

settings = Settings()

# Ensure Upload Directory exists if using local storage
if settings.STORAGE_PROVIDER == "local":
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
