from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.marketplace import Product, ProductImage, Cart, CartItem, Order, OrderItem
from app.repositories.marketplace_repository import MarketplaceRepository
from app.repositories.farm_repository import FarmRepository
from app.schemas.marketplace import ProductCreate, ProductUpdate, ProductListResponse, CartOut, OrderOut
from app.services.storage_service import get_storage_provider
import math
from typing import List

class MarketplaceService:
    @staticmethod
    def create_product(db: Session, farm_owner_id: int, product_in: ProductCreate) -> Product:
        farm = FarmRepository.get_by_owner_id(db, farm_owner_id)
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must register a farm profile before listing products."
            )
            
        product = Product(
            farm_id=farm.id,
            name=product_in.name,
            description=product_in.description,
            price=product_in.price,
            stock=product_in.stock,
            category=product_in.category,
            status="pending_approval"
        )
        return MarketplaceRepository.create_product(db, product)

    @staticmethod
    def get_product(db: Session, product_id: int) -> Product:
        product = MarketplaceRepository.get_product_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product

    @staticmethod
    def update_product(db: Session, farm_owner_id: int, product_id: int, product_in: ProductUpdate) -> Product:
        product = MarketplaceService.get_product(db, product_id)
        if product.farm.owner_id != farm_owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to edit this product"
            )
            
        for field, val in product_in.model_dump(exclude_unset=True).items():
            setattr(product, field, val)
            
        MarketplaceRepository.update(db)
        return product

    @staticmethod
    def approve_product(db: Session, product_id: int, approve_status: str) -> Product:
        product = MarketplaceService.get_product(db, product_id)
        if approve_status not in ["approved", "rejected", "pending_approval"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product approval status"
            )
        product.status = approve_status
        MarketplaceRepository.update(db)
        return product

    @staticmethod
    def list_products(
        db: Session,
        page: int = 1,
        limit: int = 20,
        search: str = "",
        category: str = "",
        status: str = "approved",
        sort: str = ""
    ) -> ProductListResponse:
        skip = (page - 1) * limit
        items = MarketplaceRepository.list_products(
            db, skip=skip, limit=limit, search=search, category=category, status=status, sort=sort
        )
        total = MarketplaceRepository.count_products(db, search=search, category=category, status=status)
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return ProductListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )

    @staticmethod
    async def upload_image(db: Session, product_id: int, file_content: bytes, filename: str) -> ProductImage:
        product = MarketplaceService.get_product(db, product_id)
        storage = get_storage_provider()
        url = await storage.upload_file(file_content, filename)
        
        product_image = ProductImage(product_id=product.id, url=url)
        return MarketplaceRepository.add_product_image(db, product_image)

    # Cart Operations
    @staticmethod
    def get_cart(db: Session, user_id: int) -> Cart:
        return MarketplaceRepository.get_cart_by_user_id(db, user_id)

    @staticmethod
    def add_to_cart(db: Session, user_id: int, product_id: int, quantity: int) -> Cart:
        cart = MarketplaceRepository.get_cart_by_user_id(db, user_id)
        product = MarketplaceService.get_product(db, product_id)
        
        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} items left in stock"
            )
            
        existing_item = MarketplaceRepository.get_cart_item(db, cart.id, product_id)
        if existing_item:
            new_qty = existing_item.quantity + quantity
            if product.stock < new_qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only {product.stock} items left in stock. Cart already contains {existing_item.quantity}."
                )
            existing_item.quantity = new_qty
        else:
            item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            MarketplaceRepository.add_cart_item(db, item)
            
        db.commit()
        db.refresh(cart)
        return cart

    @staticmethod
    def update_cart_item(db: Session, user_id: int, product_id: int, quantity: int) -> Cart:
        cart = MarketplaceRepository.get_cart_by_user_id(db, user_id)
        item = MarketplaceRepository.get_cart_item(db, cart.id, product_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not in cart"
            )
            
        product = MarketplaceService.get_product(db, product_id)
        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} items left in stock"
            )
            
        item.quantity = quantity
        db.commit()
        db.refresh(cart)
        return cart

    @staticmethod
    def remove_from_cart(db: Session, user_id: int, product_id: int) -> Cart:
        cart = MarketplaceRepository.get_cart_by_user_id(db, user_id)
        item = MarketplaceRepository.get_cart_item(db, cart.id, product_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not in cart"
            )
            
        MarketplaceRepository.remove_cart_item(db, item)
        db.refresh(cart)
        return cart

    # Checkout
    @staticmethod
    def checkout(db: Session, user_id: int) -> Order:
        cart = MarketplaceRepository.get_cart_by_user_id(db, user_id)
        if not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot checkout an empty shopping cart"
            )
            
        # Validate stock and calculate total price
        total_price = 0.0
        order_items = []
        for item in cart.items:
            product = item.product
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {product.name} is out of stock (Requested: {item.quantity}, Available: {product.stock})"
                )
            
            # Reduce product stock
            product.stock -= item.quantity
            item_price = product.price * item.quantity
            total_price += item_price
            
            order_item = OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )
            order_items.append(order_item)
            
        # Create order
        order = Order(
            tourist_id=user_id,
            total_price=total_price,
            status="pending"
        )
        MarketplaceRepository.create_order(db, order, order_items)
        
        # Clear cart
        MarketplaceRepository.clear_cart(db, cart.id)
        
        return order

    @staticmethod
    def get_order(db: Session, order_id: int, user_id: int, role: str) -> Order:
        order = MarketplaceRepository.get_order_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
            
        if role != "admin" and order.tourist_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
        return order

    @staticmethod
    def list_orders(db: Session, user_id: int, role: str) -> List[Order]:
        if role == "admin":
            return MarketplaceRepository.list_all_orders(db)
        return MarketplaceRepository.list_orders_by_user(db, user_id)
