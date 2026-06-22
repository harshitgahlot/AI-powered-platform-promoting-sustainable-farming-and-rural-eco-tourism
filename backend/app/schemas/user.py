from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional

class UserImageBase(BaseModel):
    url: str

class UserImageCreate(UserImageBase):
    pass

class UserImageOut(UserImageBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "tourist" # tourist, farmer, homestay_owner, admin

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserSuspensionUpdate(BaseModel):
    is_suspended: bool

class UserOut(UserBase):
    id: int
    is_suspended: bool
    created_at: datetime
    images: List[UserImageOut] = []
    
    model_config = ConfigDict(from_attributes=True)

# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    token_type: Optional[str] = None
    exp: Optional[float] = None
