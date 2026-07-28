import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env file
load_dotenv(dotenv_path=BASE_DIR / ".env")


class Settings:
    PROJECT_NAME: str = "RuralConnect AI"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth Configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET") or "8a9f023d8c11e74a62bb1e89c670a442e2b3c4f5a6b7c8d9e0f1a2b3c4d5e6f7"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or "30")
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS") or "7")

    
    # Database Configuration (Defaults to local SQLite for easy execution, but configures PostgreSQL in Docker)
    DATABASE_URL: str = os.getenv("DATABASE_URL") or "sqlite:///./ruralconnect.db"
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # Gemini AI Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Storage Configuration
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER") or "local"  # "local", "cloudinary", "s3"
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR") or str(BASE_DIR / "uploads")

    
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

# Validate critical configuration at startup
def _validate_config():
    errors = []
    if not settings.DATABASE_URL or settings.DATABASE_URL == "sqlite:///./ruralconnect.db":
        print("[WARNING] DATABASE_URL is using SQLite fallback. Set a Supabase PostgreSQL URL for production.", file=sys.stderr)
    if not settings.SUPABASE_JWT_SECRET:
        print("[WARNING] SUPABASE_JWT_SECRET is not set. Supabase authentication sync will not work.", file=sys.stderr)
    if not settings.GEMINI_API_KEY:
        print("[WARNING] GEMINI_API_KEY is not set. AI Chat Assistant will return configuration errors.", file=sys.stderr)

_validate_config()

# Ensure Upload Directory exists if using local storage
if settings.STORAGE_PROVIDER == "local":
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
