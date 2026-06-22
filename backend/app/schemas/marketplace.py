from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

class ProductImageBase(BaseModel):
    url: str

class ProductImageOut(ProductImageBase):
    id: int
    product_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    description: str
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    category: str # fruits, vegetables, dairy, grains, handicrafts, honey

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None

class ProductStatusUpdate(BaseModel):
    status: str # pending_approval, approved, rejected

class ProductOut(ProductBase):
    id: int
    farm_id: int
    status: str
    created_at: datetime
    images: List[ProductImageOut] = []
    
    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    limit: int
    pages: int

# Cart schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(1, gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItemOut(BaseModel):
    id: int
    cart_id: int
    product_id: int
    quantity: int
    product: ProductOut
    
    model_config = ConfigDict(from_attributes=True)

class CartOut(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    items: List[CartItemOut] = []
    
    model_config = ConfigDict(from_attributes=True)

# Order schemas
class OrderItemOut(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float
    product: ProductOut
    
    model_config = ConfigDict(from_attributes=True)

class OrderOut(BaseModel):
    id: int
    tourist_id: int
    total_price: float
    status: str # pending, processing, shipped, delivered, cancelled
    created_at: datetime
    items: List[OrderItemOut] = []
    
    model_config = ConfigDict(from_attributes=True)
