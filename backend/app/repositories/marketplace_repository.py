from sqlalchemy import select, desc, asc
from sqlalchemy.orm import Session
from app.models.marketplace import Product, ProductImage, Cart, CartItem, Order, OrderItem
from typing import Optional, List

class MarketplaceRepository:
    # Product operations
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        return db.get(Product, product_id)

    @staticmethod
    def create_product(db: Session, product: Product) -> Product:
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update(db: Session) -> None:
        db.commit()

    @staticmethod
    def list_products(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = "approved",
        sort: Optional[str] = None
    ) -> List[Product]:
        stmt = select(Product)
        if status:
            stmt = stmt.where(Product.status == status)
        if category:
            stmt = stmt.where(Product.category == category)
        if search:
            stmt = stmt.where(Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
        
        if sort == "price_asc":
            stmt = stmt.order_by(asc(Product.price))
        elif sort == "price_desc":
            stmt = stmt.order_by(desc(Product.price))
        else:
            stmt = stmt.order_by(desc(Product.created_at))
            
        stmt = stmt.offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_products(
        db: Session,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = "approved"
    ) -> int:
        stmt = select(Product)
        if status:
            stmt = stmt.where(Product.status == status)
        if category:
            stmt = stmt.where(Product.category == category)
        if search:
            stmt = stmt.where(Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
        return len(db.execute(stmt).scalars().all())

    @staticmethod
    def add_product_image(db: Session, product_image: ProductImage) -> ProductImage:
        db.add(product_image)
        db.commit()
        db.refresh(product_image)
        return product_image

    # Cart operations
    @staticmethod
    def get_cart_by_user_id(db: Session, user_id: int) -> Cart:
        stmt = select(Cart).where(Cart.user_id == user_id)
        cart = db.execute(stmt).scalars().first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    @staticmethod
    def get_cart_item(db: Session, cart_id: int, product_id: int) -> Optional[CartItem]:
        stmt = select(CartItem).where(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
        return db.execute(stmt).scalars().first()

    @staticmethod
    def add_cart_item(db: Session, cart_item: CartItem) -> CartItem:
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
        return cart_item

    @staticmethod
    def remove_cart_item(db: Session, cart_item: CartItem) -> None:
        db.delete(cart_item)
        db.commit()

    @staticmethod
    def clear_cart(db: Session, cart_id: int) -> None:
        stmt = select(CartItem).where(CartItem.cart_id == cart_id)
        items = db.execute(stmt).scalars().all()
        for item in items:
            db.delete(item)
        db.commit()

    # Order operations
    @staticmethod
    def create_order(db: Session, order: Order, items: List[OrderItem]) -> Order:
        db.add(order)
        db.commit() # Get order.id
        for item in items:
            item.order_id = order.id
            db.add(item)
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
        return db.get(Order, order_id)

    @staticmethod
    def list_orders_by_user(db: Session, user_id: int) -> List[Order]:
        stmt = select(Order).where(Order.tourist_id == user_id).order_by(desc(Order.created_at))
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_all_orders(db: Session, skip: int = 0, limit: int = 20) -> List[Order]:
        stmt = select(Order).order_by(desc(Order.created_at)).offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())
