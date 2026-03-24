from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'beni-golf-hotel-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

app = FastAPI(title="Beni Golf Hotel API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============== MODELS ==============

class UserBase(BaseModel):
    email: str  # Pode ser email ou username
    name: str
    role: str = "admin"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str  # Pode ser email ou username
    password: str

class UserResponse(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str

class CategoryBase(BaseModel):
    name: Dict[str, str]  # {fr: "", de: "", en: ""}
    order: int = 0
    active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    model_config = ConfigDict(extra="ignore")
    id: str

class MenuItemBase(BaseModel):
    name: Dict[str, str]
    description: Dict[str, str]
    price: float
    category_id: str
    image: Optional[str] = None
    active: bool = True
    order: int = 0

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    model_config = ConfigDict(extra="ignore")
    id: str

class GalleryImageBase(BaseModel):
    url: str
    alt: Dict[str, str]
    order: int = 0
    active: bool = True

class GalleryImageCreate(GalleryImageBase):
    pass

class GalleryImageResponse(GalleryImageBase):
    model_config = ConfigDict(extra="ignore")
    id: str

class SiteTextBase(BaseModel):
    page: str
    key: str
    content: Dict[str, str]

class SiteTextCreate(SiteTextBase):
    pass

class SiteTextResponse(SiteTextBase):
    model_config = ConfigDict(extra="ignore")
    id: str

class SiteImageBase(BaseModel):
    page: str
    key: str
    url: str
    alt: Dict[str, str]
    media_type: str = "image"  # "image" or "video"

class SiteImageCreate(SiteImageBase):
    pass

class SiteImageResponse(SiteImageBase):
    model_config = ConfigDict(extra="ignore")
    id: str

class SettingsBase(BaseModel):
    phone: str = ""
    address: str = ""
    opening_hours: Dict[str, str] = {}
    slogan: Dict[str, str] = {}
    email: str = ""
    social_links: Dict[str, str] = {}
    site_name: Dict[str, str] = {}

class SettingsUpdate(SettingsBase):
    pass

class SettingsResponse(SettingsBase):
    model_config = ConfigDict(extra="ignore")
    id: str

class ReservationBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    date: str
    time: str
    guests: int
    type: str = "restaurant"  # restaurant or hotel
    message: Optional[str] = None

class ReservationCreate(ReservationBase):
    pass

class ReservationResponse(ReservationBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: str
    status: str = "pending"

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.model_dump()
    user_dict["id"] = str(uuid.uuid4())
    user_dict["password"] = hash_password(user.password)
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.insert_one(user_dict)
    return UserResponse(id=user_dict["id"], email=user_dict["email"], name=user_dict["name"], role=user_dict["role"])

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ============== USERS ROUTES ==============

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(100)
    return [UserResponse(**u) for u in users]

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# ============== CATEGORIES ROUTES ==============

@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return [CategoryResponse(**c) for c in categories]

@api_router.post("/categories", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, current_user: dict = Depends(get_current_user)):
    cat_dict = category.model_dump()
    cat_dict["id"] = str(uuid.uuid4())
    await db.categories.insert_one(cat_dict)
    return CategoryResponse(**cat_dict)

@api_router.put("/categories/{cat_id}", response_model=CategoryResponse)
async def update_category(cat_id: str, category: CategoryCreate, current_user: dict = Depends(get_current_user)):
    cat_dict = category.model_dump()
    result = await db.categories.update_one({"id": cat_id}, {"$set": cat_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse(id=cat_id, **cat_dict)

@api_router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.categories.delete_one({"id": cat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# ============== MENU ITEMS ROUTES ==============

@api_router.get("/menu-items", response_model=List[MenuItemResponse])
async def get_menu_items(category_id: Optional[str] = None):
    query = {} if not category_id else {"category_id": category_id}
    items = await db.menu_items.find(query, {"_id": 0}).sort("order", 1).to_list(200)
    return [MenuItemResponse(**i) for i in items]

@api_router.post("/menu-items", response_model=MenuItemResponse)
async def create_menu_item(item: MenuItemCreate, current_user: dict = Depends(get_current_user)):
    item_dict = item.model_dump()
    item_dict["id"] = str(uuid.uuid4())
    await db.menu_items.insert_one(item_dict)
    return MenuItemResponse(**item_dict)

@api_router.put("/menu-items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(item_id: str, item: MenuItemCreate, current_user: dict = Depends(get_current_user)):
    item_dict = item.model_dump()
    result = await db.menu_items.update_one({"id": item_id}, {"$set": item_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return MenuItemResponse(id=item_id, **item_dict)

@api_router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted"}

# ============== GALLERY ROUTES ==============

@api_router.get("/gallery", response_model=List[GalleryImageResponse])
async def get_gallery():
    images = await db.gallery.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return [GalleryImageResponse(**i) for i in images]

@api_router.get("/gallery/all", response_model=List[GalleryImageResponse])
async def get_all_gallery(current_user: dict = Depends(get_current_user)):
    images = await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return [GalleryImageResponse(**i) for i in images]

@api_router.post("/gallery", response_model=GalleryImageResponse)
async def create_gallery_image(image: GalleryImageCreate, current_user: dict = Depends(get_current_user)):
    img_dict = image.model_dump()
    img_dict["id"] = str(uuid.uuid4())
    await db.gallery.insert_one(img_dict)
    return GalleryImageResponse(**img_dict)

@api_router.put("/gallery/{img_id}", response_model=GalleryImageResponse)
async def update_gallery_image(img_id: str, image: GalleryImageCreate, current_user: dict = Depends(get_current_user)):
    img_dict = image.model_dump()
    result = await db.gallery.update_one({"id": img_id}, {"$set": img_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return GalleryImageResponse(id=img_id, **img_dict)

@api_router.delete("/gallery/{img_id}")
async def delete_gallery_image(img_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.gallery.delete_one({"id": img_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted"}

# ============== SITE TEXTS ROUTES ==============

@api_router.get("/site-texts", response_model=List[SiteTextResponse])
async def get_site_texts(page: Optional[str] = None):
    query = {} if not page else {"page": page}
    texts = await db.site_texts.find(query, {"_id": 0}).to_list(200)
    return [SiteTextResponse(**t) for t in texts]

@api_router.post("/site-texts", response_model=SiteTextResponse)
async def create_site_text(text: SiteTextCreate, current_user: dict = Depends(get_current_user)):
    text_dict = text.model_dump()
    text_dict["id"] = str(uuid.uuid4())
    await db.site_texts.insert_one(text_dict)
    return SiteTextResponse(**text_dict)

@api_router.put("/site-texts/{text_id}", response_model=SiteTextResponse)
async def update_site_text(text_id: str, text: SiteTextCreate, current_user: dict = Depends(get_current_user)):
    text_dict = text.model_dump()
    result = await db.site_texts.update_one({"id": text_id}, {"$set": text_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Text not found")
    return SiteTextResponse(id=text_id, **text_dict)

@api_router.delete("/site-texts/{text_id}")
async def delete_site_text(text_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.site_texts.delete_one({"id": text_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Text not found")
    return {"message": "Text deleted"}

# ============== SITE IMAGES ROUTES ==============

@api_router.get("/site-images", response_model=List[SiteImageResponse])
async def get_site_images(page: Optional[str] = None):
    query = {} if not page else {"page": page}
    images = await db.site_images.find(query, {"_id": 0}).to_list(200)
    return [SiteImageResponse(**i) for i in images]

@api_router.post("/site-images", response_model=SiteImageResponse)
async def create_site_image(image: SiteImageCreate, current_user: dict = Depends(get_current_user)):
    img_dict = image.model_dump()
    img_dict["id"] = str(uuid.uuid4())
    await db.site_images.insert_one(img_dict)
    return SiteImageResponse(**img_dict)

@api_router.put("/site-images/{img_id}", response_model=SiteImageResponse)
async def update_site_image(img_id: str, image: SiteImageCreate, current_user: dict = Depends(get_current_user)):
    img_dict = image.model_dump()
    result = await db.site_images.update_one({"id": img_id}, {"$set": img_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return SiteImageResponse(id=img_id, **img_dict)

@api_router.delete("/site-images/{img_id}")
async def delete_site_image(img_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.site_images.delete_one({"id": img_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted"}

# ============== SETTINGS ROUTES ==============

@api_router.get("/settings", response_model=SettingsResponse)
async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        default_settings = {
            "id": str(uuid.uuid4()),
            "phone": "+352 92 93 95 1",
            "address": "2, Rue du Château, L-9748 Clervaux, Luxembourg",
            "opening_hours": {
                "fr": "Mardi - Dimanche: 12h00 - 14h00, 18h30 - 21h30\nLundi: Fermé",
                "de": "Dienstag - Sonntag: 12:00 - 14:00, 18:30 - 21:30\nMontag: Geschlossen",
                "en": "Tuesday - Sunday: 12:00 - 14:00, 18:30 - 21:30\nMonday: Closed",
                "pt": "Terça - Domingo: 12h00 - 14h00, 18h30 - 21h30\nSegunda: Fechado"
            },
            "slogan": {
                "fr": "Une expérience gastronomique unique au cœur du Luxembourg",
                "de": "Ein einzigartiges gastronomisches Erlebnis im Herzen Luxemburgs",
                "en": "A unique gastronomic experience in the heart of Luxembourg",
                "pt": "Uma experiência gastronômica única no coração de Luxemburgo"
            },
            "email": "info@benigolfhotel.lu",
            "social_links": {"instagram": "", "facebook": "", "twitter": ""},
            "site_name": {
                "fr": "BENI GOLF CLUB",
                "de": "BENI GOLF CLUB",
                "en": "BENI GOLF CLUB",
                "pt": "BENI GOLF CLUB"
            }
        }
        await db.settings.insert_one(default_settings)
        return SettingsResponse(**default_settings)
    return SettingsResponse(**settings)

@api_router.put("/settings", response_model=SettingsResponse)
async def update_settings(settings: SettingsUpdate, current_user: dict = Depends(get_current_user)):
    settings_dict = settings.model_dump()
    existing = await db.settings.find_one({}, {"_id": 0})
    if existing:
        await db.settings.update_one({"id": existing["id"]}, {"$set": settings_dict})
        return SettingsResponse(id=existing["id"], **settings_dict)
    else:
        settings_dict["id"] = str(uuid.uuid4())
        await db.settings.insert_one(settings_dict)
        return SettingsResponse(**settings_dict)

# ============== RESERVATIONS ROUTES ==============

@api_router.get("/reservations", response_model=List[ReservationResponse])
async def get_reservations(current_user: dict = Depends(get_current_user)):
    reservations = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [ReservationResponse(**r) for r in reservations]

@api_router.post("/reservations", response_model=ReservationResponse)
async def create_reservation(reservation: ReservationCreate):
    res_dict = reservation.model_dump()
    res_dict["id"] = str(uuid.uuid4())
    res_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    res_dict["status"] = "pending"
    await db.reservations.insert_one(res_dict)
    return ReservationResponse(**res_dict)

@api_router.put("/reservations/{res_id}/status")
async def update_reservation_status(res_id: str, status: str = "pending", current_user: dict = Depends(get_current_user)):
    result = await db.reservations.update_one({"id": res_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": "Status updated"}

@api_router.delete("/reservations/{res_id}")
async def delete_reservation(res_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.reservations.delete_one({"id": res_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": "Reservation deleted"}

# ============== UPLOAD ROUTE ==============

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    contents = await file.read()
    encoded = base64.b64encode(contents).decode('utf-8')
    content_type = file.content_type or "image/jpeg"
    data_url = f"data:{content_type};base64,{encoded}"
    return {"url": data_url}

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    # Check if already seeded
    existing_user = await db.users.find_one({"email": "admin@benigolfhotel.lu"})
    if existing_user:
        return {"message": "Database already seeded"}
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@benigolfhotel.lu",
        "name": "Administrator",
        "password": hash_password("admin123"),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    
    # Create categories
    categories = [
        {"id": str(uuid.uuid4()), "name": {"fr": "Entrées", "de": "Vorspeisen", "en": "Starters"}, "order": 1, "active": True},
        {"id": str(uuid.uuid4()), "name": {"fr": "Plats Principaux", "de": "Hauptgerichte", "en": "Main Courses"}, "order": 2, "active": True},
        {"id": str(uuid.uuid4()), "name": {"fr": "Desserts", "de": "Desserts", "en": "Desserts"}, "order": 3, "active": True},
        {"id": str(uuid.uuid4()), "name": {"fr": "Vins", "de": "Weine", "en": "Wines"}, "order": 4, "active": True},
    ]
    await db.categories.insert_many(categories)
    
    # Create menu items
    menu_items = [
        {
            "id": str(uuid.uuid4()),
            "name": {"fr": "Foie Gras Maison", "de": "Hausgemachte Foie Gras", "en": "Homemade Foie Gras"},
            "description": {"fr": "Foie gras de canard mi-cuit, chutney de figues, brioche toastée", "de": "Halbgare Entenleberpastete, Feigenchutney, getoastete Brioche", "en": "Semi-cooked duck foie gras, fig chutney, toasted brioche"},
            "price": 24.0,
            "category_id": categories[0]["id"],
            "image": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600",
            "active": True,
            "order": 1
        },
        {
            "id": str(uuid.uuid4()),
            "name": {"fr": "Carpaccio de Bœuf", "de": "Rindercarpaccio", "en": "Beef Carpaccio"},
            "description": {"fr": "Fines tranches de bœuf, roquette, parmesan, huile de truffe", "de": "Dünne Rindfleischscheiben, Rucola, Parmesan, Trüffelöl", "en": "Thin slices of beef, arugula, parmesan, truffle oil"},
            "price": 18.0,
            "category_id": categories[0]["id"],
            "image": "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600",
            "active": True,
            "order": 2
        },
        {
            "id": str(uuid.uuid4()),
            "name": {"fr": "Filet de Bœuf Wellington", "de": "Rinderfilet Wellington", "en": "Beef Wellington"},
            "description": {"fr": "Filet de bœuf en croûte, duxelles de champignons, sauce au vin rouge", "de": "Rinderfilet im Teigmantel, Champignon-Duxelles, Rotweinsauce", "en": "Beef fillet in pastry, mushroom duxelles, red wine sauce"},
            "price": 45.0,
            "category_id": categories[1]["id"],
            "image": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600",
            "active": True,
            "order": 1
        },
        {
            "id": str(uuid.uuid4()),
            "name": {"fr": "Dos de Cabillaud", "de": "Kabeljaurücken", "en": "Cod Fillet"},
            "description": {"fr": "Dos de cabillaud rôti, risotto aux petits pois, beurre blanc", "de": "Gebratener Kabeljaurücken, Erbsenrisotto, Weißweinsauce", "en": "Roasted cod fillet, pea risotto, white butter sauce"},
            "price": 36.0,
            "category_id": categories[1]["id"],
            "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600",
            "active": True,
            "order": 2
        },
        {
            "id": str(uuid.uuid4()),
            "name": {"fr": "Tarte au Chocolat", "de": "Schokoladentarte", "en": "Chocolate Tart"},
            "description": {"fr": "Tarte au chocolat noir, crème anglaise, glace vanille", "de": "Zartbitterschokoladentarte, Vanillesauce, Vanilleeis", "en": "Dark chocolate tart, custard, vanilla ice cream"},
            "price": 14.0,
            "category_id": categories[2]["id"],
            "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
            "active": True,
            "order": 1
        },
        {
            "id": str(uuid.uuid4()),
            "name": {"fr": "Crème Brûlée", "de": "Crème Brûlée", "en": "Crème Brûlée"},
            "description": {"fr": "Crème brûlée à la vanille de Madagascar", "de": "Crème Brûlée mit Madagaskar-Vanille", "en": "Madagascar vanilla crème brûlée"},
            "price": 12.0,
            "category_id": categories[2]["id"],
            "image": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600",
            "active": True,
            "order": 2
        },
    ]
    await db.menu_items.insert_many(menu_items)
    
    # Create gallery images
    gallery_images = [
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", "alt": {"fr": "Intérieur du restaurant", "de": "Restaurantinnenraum", "en": "Restaurant interior"}, "order": 1, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", "alt": {"fr": "Plat gastronomique", "de": "Gourmetgericht", "en": "Gourmet dish"}, "order": 2, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", "alt": {"fr": "Vue du golf", "de": "Golfplatzansicht", "en": "Golf course view"}, "order": 3, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", "alt": {"fr": "Chambre d'hôtel", "de": "Hotelzimmer", "en": "Hotel room"}, "order": 4, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "alt": {"fr": "Terrasse", "de": "Terrasse", "en": "Terrace"}, "order": 5, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", "alt": {"fr": "Cuisine raffinée", "de": "Feine Küche", "en": "Fine cuisine"}, "order": 6, "active": True},
    ]
    await db.gallery.insert_many(gallery_images)
    
    # Create site texts
    site_texts = [
        {"id": str(uuid.uuid4()), "page": "home", "key": "hero_title", "content": {"fr": "Beni Golf & Hôtel", "de": "Beni Golf & Hotel", "en": "Beni Golf & Hotel"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "hero_subtitle", "content": {"fr": "Une expérience gastronomique d'exception au cœur du Luxembourg", "de": "Ein außergewöhnliches gastronomisches Erlebnis im Herzen Luxemburgs", "en": "An exceptional gastronomic experience in the heart of Luxembourg"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "intro_title", "content": {"fr": "Bienvenue", "de": "Willkommen", "en": "Welcome"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "intro_text", "content": {"fr": "Niché au cœur de Clervaux, notre établissement vous invite à découvrir une cuisine raffinée dans un cadre exceptionnel. Entre tradition et modernité, notre chef sublime les produits du terroir luxembourgeois.", "de": "Im Herzen von Clervaux gelegen, lädt unser Haus Sie ein, eine raffinierte Küche in einem außergewöhnlichen Rahmen zu entdecken. Zwischen Tradition und Moderne verfeinert unser Küchenchef die Produkte der luxemburgischen Region.", "en": "Nestled in the heart of Clervaux, our establishment invites you to discover refined cuisine in an exceptional setting. Between tradition and modernity, our chef elevates the products of the Luxembourg region."}},
        {"id": str(uuid.uuid4()), "page": "story", "key": "title", "content": {"fr": "Notre Histoire", "de": "Unsere Geschichte", "en": "Our Story"}},
        {"id": str(uuid.uuid4()), "page": "story", "key": "content", "content": {"fr": "C'est avec passion et dévouement que nous avons créé ce lieu unique. Notre histoire est celle d'une famille unie par l'amour de la gastronomie et le désir de partager des moments d'exception avec nos convives.\n\nChaque plat raconte une histoire, chaque saveur évoque un souvenir. Notre cuisine est le reflet de notre parcours, alliant les techniques classiques aux influences contemporaines.\n\nAu fil des années, nous avons cultivé des relations privilégiées avec les producteurs locaux, garantissant ainsi la fraîcheur et la qualité exceptionnelle de nos ingrédients.", "de": "Mit Leidenschaft und Hingabe haben wir diesen einzigartigen Ort geschaffen. Unsere Geschichte ist die einer Familie, die durch die Liebe zur Gastronomie und den Wunsch verbunden ist, außergewöhnliche Momente mit unseren Gästen zu teilen.\n\nJedes Gericht erzählt eine Geschichte, jeder Geschmack weckt eine Erinnerung. Unsere Küche spiegelt unseren Werdegang wider und verbindet klassische Techniken mit zeitgenössischen Einflüssen.\n\nIm Laufe der Jahre haben wir privilegierte Beziehungen zu lokalen Erzeugern aufgebaut, um die Frische und außergewöhnliche Qualität unserer Zutaten zu gewährleisten.", "en": "It is with passion and dedication that we created this unique place. Our story is that of a family united by the love of gastronomy and the desire to share exceptional moments with our guests.\n\nEach dish tells a story, each flavor evokes a memory. Our cuisine reflects our journey, combining classical techniques with contemporary influences.\n\nOver the years, we have cultivated privileged relationships with local producers, thus guaranteeing the freshness and exceptional quality of our ingredients."}},
        {"id": str(uuid.uuid4()), "page": "golf", "key": "title", "content": {"fr": "The Golf Club", "de": "Der Golfclub", "en": "The Golf Club"}},
        {"id": str(uuid.uuid4()), "page": "golf", "key": "description", "content": {"fr": "Découvrez notre parcours de golf 18 trous, niché dans les collines verdoyantes du nord du Luxembourg. Un terrain de jeu exceptionnel pour les passionnés de golf de tous niveaux.", "de": "Entdecken Sie unseren 18-Loch-Golfplatz, eingebettet in die grünen Hügel im Norden Luxemburgs. Ein außergewöhnlicher Spielplatz für Golfbegeisterte aller Niveaus.", "en": "Discover our 18-hole golf course, nestled in the green hills of northern Luxembourg. An exceptional playground for golf enthusiasts of all levels."}},
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "title", "content": {"fr": "L'Hôtel", "de": "Das Hotel", "en": "The Hotel"}},
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "description", "content": {"fr": "23 chambres et suites élégantes vous attendent pour un séjour inoubliable. Profitez du calme de la nature luxembourgeoise tout en bénéficiant d'un confort moderne et d'un service attentionné.", "de": "23 elegante Zimmer und Suiten erwarten Sie für einen unvergesslichen Aufenthalt. Genießen Sie die Ruhe der luxemburgischen Natur bei modernem Komfort und aufmerksamem Service.", "en": "23 elegant rooms and suites await you for an unforgettable stay. Enjoy the tranquility of Luxembourg's nature while benefiting from modern comfort and attentive service."}},
        {"id": str(uuid.uuid4()), "page": "reservations", "key": "title", "content": {"fr": "Réservations", "de": "Reservierungen", "en": "Reservations"}},
        {"id": str(uuid.uuid4()), "page": "reservations", "key": "subtitle", "content": {"fr": "Réservez votre table ou votre chambre", "de": "Reservieren Sie Ihren Tisch oder Ihr Zimmer", "en": "Book your table or room"}},
    ]
    await db.site_texts.insert_many(site_texts)
    
    # Create site images - ALL images used in the site
    site_images = [
        # HOME PAGE
        {"id": str(uuid.uuid4()), "page": "home", "key": "hero", "url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920", "alt": {"fr": "Vue panoramique", "de": "Panoramablick", "en": "Panoramic view"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "intro", "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", "alt": {"fr": "Notre cuisine", "de": "Unsere Küche", "en": "Our cuisine"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "pillar_restaurant", "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600", "alt": {"fr": "Restaurant", "de": "Restaurant", "en": "Restaurant"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "pillar_hotel", "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600", "alt": {"fr": "Hôtel", "de": "Hotel", "en": "Hotel"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "pillar_golf", "url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600", "alt": {"fr": "Golf", "de": "Golf", "en": "Golf"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "cta_background", "url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920", "alt": {"fr": "Intérieur du restaurant", "de": "Restaurantinnenraum", "en": "Restaurant interior"}},
        
        # STORY PAGE
        {"id": str(uuid.uuid4()), "page": "story", "key": "main", "url": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1920", "alt": {"fr": "Notre chef", "de": "Unser Küchenchef", "en": "Our chef"}},
        {"id": str(uuid.uuid4()), "page": "story", "key": "grid1", "url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600", "alt": {"fr": "Cuisine", "de": "Küche", "en": "Kitchen"}},
        {"id": str(uuid.uuid4()), "page": "story", "key": "grid2", "url": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600", "alt": {"fr": "Plat", "de": "Gericht", "en": "Dish"}},
        {"id": str(uuid.uuid4()), "page": "story", "key": "grid3", "url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600", "alt": {"fr": "Vue", "de": "Aussicht", "en": "View"}},
        
        # GOLF PAGE
        {"id": str(uuid.uuid4()), "page": "golf", "key": "hero", "url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920", "alt": {"fr": "Parcours de golf", "de": "Golfplatz", "en": "Golf course"}},
        {"id": str(uuid.uuid4()), "page": "golf", "key": "image1", "url": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800", "alt": {"fr": "Parcours de golf", "de": "Golfplatz", "en": "Golf Course"}},
        {"id": str(uuid.uuid4()), "page": "golf", "key": "image2", "url": "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800", "alt": {"fr": "Golf", "de": "Golf", "en": "Golf"}},
        
        # HOTEL PAGE
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "hero", "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920", "alt": {"fr": "L'hôtel", "de": "Das Hotel", "en": "The hotel"}},
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "room1", "url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800", "alt": {"fr": "Suite Deluxe", "de": "Deluxe Suite", "en": "Deluxe Suite"}},
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "room2", "url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800", "alt": {"fr": "Chambre Supérieure", "de": "Superior Zimmer", "en": "Superior Room"}},
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "room3", "url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800", "alt": {"fr": "Chambre Standard", "de": "Standardzimmer", "en": "Standard Room"}},
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "experience1", "url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600", "alt": {"fr": "Intérieur de l'hôtel", "de": "Hoteleinrichtung", "en": "Hotel Interior"}},
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "experience2", "url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600", "alt": {"fr": "Vue de l'hôtel", "de": "Hotelansicht", "en": "Hotel View"}},
    ]
    await db.site_images.insert_many(site_images)
    
    # Create gallery images
    gallery_images = [
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", "alt": {"fr": "Parcours de golf", "de": "Golfplatz", "en": "Golf course", "pt": "Campo de golfe"}, "category": "golf", "order": 1, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800", "alt": {"fr": "Vue du parcours", "de": "Platzansicht", "en": "Course view", "pt": "Vista do campo"}, "category": "golf", "order": 2, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800", "alt": {"fr": "Golfeur", "de": "Golfspieler", "en": "Golfer", "pt": "Jogador de golfe"}, "category": "golf", "order": 3, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", "alt": {"fr": "Restaurant gastronomique", "de": "Gourmetrestaurant", "en": "Fine dining", "pt": "Restaurante gastronômico"}, "category": "restaurant", "order": 4, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", "alt": {"fr": "Salle du restaurant", "de": "Speisesaal", "en": "Dining room", "pt": "Salão do restaurante"}, "category": "restaurant", "order": 5, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800", "alt": {"fr": "Plat signature", "de": "Signature-Gericht", "en": "Signature dish", "pt": "Prato especial"}, "category": "restaurant", "order": 6, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", "alt": {"fr": "Façade de l'hôtel", "de": "Hotelfassade", "en": "Hotel facade", "pt": "Fachada do hotel"}, "category": "hotel", "order": 7, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800", "alt": {"fr": "Suite luxueuse", "de": "Luxuriöse Suite", "en": "Luxury suite", "pt": "Suíte de luxo"}, "category": "hotel", "order": 8, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800", "alt": {"fr": "Chambre avec vue", "de": "Zimmer mit Aussicht", "en": "Room with a view", "pt": "Quarto com vista"}, "category": "hotel", "order": 9, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", "alt": {"fr": "Intérieur élégant", "de": "Elegantes Interieur", "en": "Elegant interior", "pt": "Interior elegante"}, "category": "hotel", "order": 10, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800", "alt": {"fr": "Notre chef", "de": "Unser Küchenchef", "en": "Our chef", "pt": "Nosso chef"}, "category": "restaurant", "order": 11, "active": True},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800", "alt": {"fr": "Cuisine en action", "de": "Küche in Aktion", "en": "Kitchen in action", "pt": "Cozinha em ação"}, "category": "restaurant", "order": 12, "active": True},
    ]
    await db.gallery.insert_many(gallery_images)
    
    return {"message": "Database seeded successfully", "admin": {"email": "admin@benigolfhotel.lu", "password": "admin123"}}

# ============== ROOT ==============

@api_router.get("/")
async def root():
    return {"message": "Beni Golf Hotel API", "version": "1.0.0"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
