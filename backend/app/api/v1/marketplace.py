from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.marketplace import (
    ProductCreate, ProductUpdate, ProductOut, ProductListResponse,
    ProductStatusUpdate, ProductImageOut, CartOut, CartItemCreate, CartItemUpdate, OrderOut
)
from app.services.marketplace_service import MarketplaceService
from app.api.v1.users import get_current_user, get_admin_user
from app.api.v1.farms import get_farmer_user
from typing import List, Optional

router = APIRouter()

# Products API
@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    farmer: User = Depends(get_farmer_user)
):
    return MarketplaceService.create_product(db, farmer.id, product_in)

@router.get("/products", response_model=ProductListResponse)
def list_products(
    page: int = 1,
    limit: int = 20,
    search: str = "",
    category: str = "",
    status: str = "approved",
    sort: str = "",
    db: Session = Depends(get_db)
):
    return MarketplaceService.list_products(
        db, page=page, limit=limit, search=search, category=category, status=status, sort=sort
    )

@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return MarketplaceService.get_product(db, product_id)

@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    farmer: User = Depends(get_farmer_user)
):
    return MarketplaceService.update_product(db, farmer.id, product_id, product_in)

@router.post("/products/{product_id}/upload-image", response_model=ProductImageOut)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    farmer: User = Depends(get_farmer_user)
):
    product = MarketplaceService.get_product(db, product_id)
    if product.farm.owner_id != farmer.id and farmer.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this product"
        )
    content = await file.read()
    return await MarketplaceService.upload_image(db, product_id, content, file.filename)

@router.put("/products/{product_id}/approve", response_model=ProductOut)
def approve_product(
    product_id: int,
    status_update: ProductStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    return MarketplaceService.approve_product(db, product_id, status_update.status)

# Cart API
@router.get("/cart", response_model=CartOut)
def get_user_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MarketplaceService.get_cart(db, current_user.id)

@router.post("/cart/items", response_model=CartOut)
def add_item_to_cart(
    item_in: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MarketplaceService.add_to_cart(db, current_user.id, item_in.product_id, item_in.quantity)

@router.put("/cart/items/{product_id}", response_model=CartOut)
def update_cart_item_quantity(
    product_id: int,
    item_in: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MarketplaceService.update_cart_item(db, current_user.id, product_id, item_in.quantity)

@router.delete("/cart/items/{product_id}", response_model=CartOut)
def remove_item_from_cart(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MarketplaceService.remove_from_cart(db, current_user.id, product_id)

# Checkout API
@router.post("/checkout", response_model=OrderOut)
def checkout_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MarketplaceService.checkout(db, current_user.id)

# Orders API
@router.get("/orders", response_model=List[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MarketplaceService.list_orders(db, current_user.id, current_user.role)

@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MarketplaceService.get_order(db, order_id, current_user.id, current_user.role)
