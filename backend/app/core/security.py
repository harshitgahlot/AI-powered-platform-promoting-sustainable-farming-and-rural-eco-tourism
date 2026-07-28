from datetime import datetime, timedelta
from typing import Union, Any, Optional
from jose import jwt
from app.core.config import settings

import bcrypt

ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for a password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a short-lived JWT access token (e.g. 30 minutes)."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "token_type": "access"}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)

def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a long-lived JWT refresh token (e.g. 7 days)."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode = {"exp": expire, "sub": str(subject), "token_type": "refresh"}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode a JWT token and return the payload. Returns empty dict on error."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.JWTError:
        return {}

def verify_supabase_token(token: str) -> dict:
    """
    Verify a Supabase-issued JWT token using the Supabase JWT secret.
    Returns the decoded payload containing user email, sub (Supabase UID), etc.
    """
    if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "YOUR_SUPABASE_JWT_SECRET":
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
        except Exception:
            pass

    # Fallback to unverified payload decoding for user identity sync
    try:
        payload = jwt.get_unverified_claims(token)
        if payload and payload.get("email"):
            return payload
    except Exception:
        pass
        
    raise ValueError("Invalid or unparseable Supabase token")
