from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User, UserImage
from app.models.farm import Farm, FarmImage
from app.models.homestay import Homestay, HomestayImage, Room
from app.models.marketplace import Product, ProductImage, Cart, CartItem, Order, OrderItem
from app.models.booking import FarmBooking, HomestayBooking
from app.models.review import Review
from app.models.metrics import DailyMetric, MonthlyMetric
from app.core import security
import datetime

def seed_database(db: Session):
    # Check if we already have users seeded
    stmt = select(User)
    existing_user = db.execute(stmt).scalars().first()
    if existing_user:
        print("Database already contains data. Skipping seeding.")
        return

    print("Seeding database with sample records...")
    
    # 1. Create Users
    admin = User(
        email="admin@ruralconnect.com",
        password_hash=security.get_password_hash("admin123"),
        full_name="Admin Director",
        role="admin"
    )
    farmer = User(
        email="farmer@ruralconnect.com",
        password_hash=security.get_password_hash("farmer123"),
        full_name="Ramesh Kumar",
        role="farmer"
    )
    owner = User(
        email="owner@ruralconnect.com",
        password_hash=security.get_password_hash("owner123"),
        full_name="Sunita Devi",
        role="homestay_owner"
    )
    tourist = User(
        email="tourist@ruralconnect.com",
        password_hash=security.get_password_hash("tourist123"),
        full_name="John Doe",
        role="tourist"
    )
    
    db.add_all([admin, farmer, owner, tourist])
    db.commit() # Flush to get user IDs
    
    # Create empty carts for users
    for user in [admin, farmer, owner, tourist]:
        cart = Cart(user_id=user.id)
        db.add(cart)
    db.commit()

    # 2. Add profile photos
    db.add_all([
        UserImage(user_id=farmer.id, url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"),
        UserImage(user_id=owner.id, url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"),
        UserImage(user_id=tourist.id, url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
    ])
    db.commit()

    # 3. Create Farm
    farm = Farm(
        owner_id=farmer.id,
        name="Green Meadows Organic Farm",
        description="A beautiful organic farm specializing in high-altitude tea cultivation, local honey extraction, and heirloom vegetables. Visitors can experience hands-on milking, tea leaves plucking, and eco-tours.",
        location="Himachal Hills, India",
        latitude=32.2190,
        longitude=76.3234,
        status="approved",
        rating=4.8
    )
    db.add(farm)
    db.commit()
    
    db.add_all([
        FarmImage(farm_id=farm.id, url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800"),
        FarmImage(farm_id=farm.id, url="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800")
    ])
    db.commit()

    # 4. Create Homestay
    homestay = Homestay(
        owner_id=owner.id,
        name="Sunita's Himalayan Foothill Resort",
        description="Nestled in a peaceful valley with panoramic views of snow-capped mountains. We serve home-cooked organic meals harvested directly from our neighbor's fields. Cozy wooden rooms with modern bathrooms.",
        location="Himachal Hills, India",
        latitude=32.2215,
        longitude=76.3201,
        status="approved",
        rating=4.9
    )
    db.add(homestay)
    db.commit()
    
    db.add_all([
        HomestayImage(homestay_id=homestay.id, url="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"),
        HomestayImage(homestay_id=homestay.id, url="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800")
    ])
    db.commit()

    # 5. Create Rooms
    room1 = Room(
        homestay_id=homestay.id,
        name="Pine Wood Suite",
        description="Spacious double room featuring private balcony, local cedar wood furniture, and mountain valley views.",
        price_per_night=35.0,
        occupancy=2,
        is_available=True
    )
    room2 = Room(
        homestay_id=homestay.id,
        name="Eco Attic Room",
        description="Cozy room located on the attic floor with roof windows, perfect for stargazing. Shared modern bathroom.",
        price_per_night=25.0,
        occupancy=1,
        is_available=True
    )
    db.add_all([room1, room2])
    db.commit()

    # 6. Create Marketplace Products
    p1 = Product(
        farm_id=farm.id,
        name="Wild Himalayan Forest Honey",
        description="100% pure raw honey collected from wild hives in the high mountains of Himachal. Unprocessed and unfiltered.",
        price=12.50,
        stock=45,
        category="honey",
        status="approved"
    )
    p2 = Product(
        farm_id=farm.id,
        name="Organic Orthodox Green Tea",
        description="Hand-plucked green tea leaves. Rich in antioxidants with a smooth, earthy taste from our tea gardens.",
        price=8.00,
        stock=120,
        category="grains",
        status="approved"
    )
    p3 = Product(
        farm_id=farm.id,
        name="Handwoven Woolen Shawl",
        description="Woven with pure sheep wool by local artisans using traditional geometric patterns. Keeps you extremely warm.",
        price=30.00,
        stock=15,
        category="handicrafts",
        status="approved"
    )
    db.add_all([p1, p2, p3])
    db.commit()

    db.add_all([
        ProductImage(product_id=p1.id, url="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500"),
        ProductImage(product_id=p2.id, url="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500"),
        ProductImage(product_id=p3.id, url="https://images.unsplash.com/photo-1544816155-12df9643f363?w=500")
    ])
    db.commit()

    # 7. Add Bookings
    fb1 = FarmBooking(
        tourist_id=tourist.id,
        farm_id=farm.id,
        visit_date=datetime.date.today() + datetime.timedelta(days=3),
        number_of_guests=2,
        total_price=30.0,
        status="confirmed"
    )
    hb1 = HomestayBooking(
        tourist_id=tourist.id,
        room_id=room1.id,
        check_in=datetime.date.today() + datetime.timedelta(days=2),
        check_out=datetime.date.today() + datetime.timedelta(days=5),
        total_price=105.0,
        status="confirmed"
    )
    db.add_all([fb1, hb1])
    db.commit()

    # 8. Add Reviews
    rev1 = Review(
        user_id=tourist.id,
        target_type="farm",
        target_id=farm.id,
        rating=5,
        comment="Absolutely lovely farm visit! रमेश (Ramesh) was super nice, showed us the beehives, and we tasted fresh green tea. Very educational.",
        sentiment_score=0.88,
        status="approved"
    )
    rev2 = Review(
        user_id=tourist.id,
        target_type="homestay",
        target_id=homestay.id,
        rating=5,
        comment="Beautiful views, clean bedding, and delicious local food. Sunita treats everyone like family. Best stay!",
        sentiment_score=0.92,
        status="approved"
    )
    db.add_all([rev1, rev2])
    db.commit()

    # 9. Populate Analytics Metrics
    m1 = DailyMetric(
        date=datetime.date.today() - datetime.timedelta(days=2),
        total_revenue=135.0,
        bookings_count=2,
        orders_count=1,
        active_users=8
    )
    m2 = DailyMetric(
        date=datetime.date.today() - datetime.timedelta(days=1),
        total_revenue=180.0,
        bookings_count=3,
        orders_count=2,
        active_users=12
    )
    m3 = DailyMetric(
        date=datetime.date.today(),
        total_revenue=250.0,
        bookings_count=4,
        orders_count=3,
        active_users=15
    )
    db.add_all([m1, m2, m3])
    
    monthly = MonthlyMetric(
        year=datetime.date.today().year,
        month=datetime.date.today().month,
        total_revenue=565.0,
        bookings_count=9,
        orders_count=6,
        active_users=25
    )
    db.add(monthly)
    db.commit()

    print("Database seeding completed successfully!")
