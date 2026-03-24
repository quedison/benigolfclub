#!/usr/bin/env python3
"""Seed script to populate the database with initial data."""

import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import bcrypt
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent / "backend"
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'benigolfclub_db')

async def seed_database():
    print(f"Connecting to MongoDB: {MONGO_URL}")
    print(f"Database: {DB_NAME}")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing data
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.categories.delete_many({})
    await db.menu_items.delete_many({})
    await db.site_texts.delete_many({})
    await db.site_images.delete_many({})
    await db.gallery.delete_many({})
    await db.settings.delete_many({})
    
    # Create admin user
    print("Creating admin user...")
    password_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
    await db.users.insert_one({
        "id": str(uuid.uuid4()),
        "email": "admin@benigolfhotel.lu",
        "name": "Administrator",
        "password": password_hash,
        "role": "admin",
        "active": True
    })
    
    # Create categories
    print("Creating categories...")
    categories = [
        {"id": str(uuid.uuid4()), "name": {"fr": "Entrées", "de": "Vorspeisen", "en": "Starters"}, "description": {"fr": "Nos entrées raffinées", "de": "Unsere raffinierten Vorspeisen", "en": "Our refined starters"}, "order": 1, "active": True},
        {"id": str(uuid.uuid4()), "name": {"fr": "Plats", "de": "Hauptgerichte", "en": "Main Courses"}, "description": {"fr": "Nos plats principaux", "de": "Unsere Hauptgerichte", "en": "Our main courses"}, "order": 2, "active": True},
        {"id": str(uuid.uuid4()), "name": {"fr": "Desserts", "de": "Desserts", "en": "Desserts"}, "description": {"fr": "Nos desserts gourmands", "de": "Unsere Gourmet-Desserts", "en": "Our gourmet desserts"}, "order": 3, "active": True},
        {"id": str(uuid.uuid4()), "name": {"fr": "Vins", "de": "Weine", "en": "Wines"}, "description": {"fr": "Notre sélection de vins", "de": "Unsere Weinauswahl", "en": "Our wine selection"}, "order": 4, "active": True},
    ]
    await db.categories.insert_many(categories)
    
    # Create menu items
    print("Creating menu items...")
    entrees_id = categories[0]["id"]
    plats_id = categories[1]["id"]
    desserts_id = categories[2]["id"]
    
    menu_items = [
        {"id": str(uuid.uuid4()), "category_id": entrees_id, "name": {"fr": "Foie Gras Maison", "de": "Hausgemachte Gänseleber", "en": "Homemade Foie Gras"}, "description": {"fr": "Accompagné de chutney de figues", "de": "Mit Feigenchutney", "en": "With fig chutney"}, "price": 24.0, "image": "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400", "active": True},
        {"id": str(uuid.uuid4()), "category_id": entrees_id, "name": {"fr": "Carpaccio de Bœuf", "de": "Rindercarpaccio", "en": "Beef Carpaccio"}, "description": {"fr": "Avec roquette et parmesan", "de": "Mit Rucola und Parmesan", "en": "With arugula and parmesan"}, "price": 18.0, "image": "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400", "active": True},
        {"id": str(uuid.uuid4()), "category_id": plats_id, "name": {"fr": "Filet de Bœuf", "de": "Rinderfilet", "en": "Beef Filet"}, "description": {"fr": "Sauce au poivre, légumes de saison", "de": "Pfeffersoße, Saisongemüse", "en": "Pepper sauce, seasonal vegetables"}, "price": 38.0, "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", "active": True},
        {"id": str(uuid.uuid4()), "category_id": plats_id, "name": {"fr": "Saumon Grillé", "de": "Gegrillter Lachs", "en": "Grilled Salmon"}, "description": {"fr": "Risotto aux asperges", "de": "Spargelrisotto", "en": "Asparagus risotto"}, "price": 32.0, "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400", "active": True},
        {"id": str(uuid.uuid4()), "category_id": desserts_id, "name": {"fr": "Fondant au Chocolat", "de": "Schokoladenfondant", "en": "Chocolate Fondant"}, "description": {"fr": "Cœur coulant, glace vanille", "de": "Flüssiger Kern, Vanilleeis", "en": "Molten center, vanilla ice cream"}, "price": 14.0, "image": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400", "active": True},
    ]
    await db.menu_items.insert_many(menu_items)
    
    # Create site images
    print("Creating site images...")
    site_images = [
        {"id": str(uuid.uuid4()), "page": "home", "key": "hero", "url": "https://images.pexels.com/photos/164250/pexels-photo-164250.jpeg?auto=compress&cs=tinysrgb&w=1920", "alt": {"fr": "Vue panoramique du golf", "de": "Panoramablick auf den Golfplatz", "en": "Panoramic golf view"}, "type": "image"},
        {"id": str(uuid.uuid4()), "page": "home", "key": "intro", "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", "alt": {"fr": "Cuisine raffinée", "de": "Feine Küche", "en": "Fine cuisine"}, "type": "image"},
        {"id": str(uuid.uuid4()), "page": "story", "key": "hero", "url": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1920", "alt": {"fr": "Notre chef", "de": "Unser Küchenchef", "en": "Our chef"}, "type": "image"},
        {"id": str(uuid.uuid4()), "page": "menu", "key": "hero", "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920", "alt": {"fr": "Menu", "de": "Menü", "en": "Menu"}, "type": "image"},
        {"id": str(uuid.uuid4()), "page": "gallery", "key": "hero", "url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920", "alt": {"fr": "Galerie", "de": "Galerie", "en": "Gallery"}, "type": "image"},
        {"id": str(uuid.uuid4()), "page": "golf", "key": "hero", "url": "https://images.pexels.com/photos/164250/pexels-photo-164250.jpeg?auto=compress&cs=tinysrgb&w=1920", "alt": {"fr": "Golf", "de": "Golf", "en": "Golf"}, "type": "image"},
        {"id": str(uuid.uuid4()), "page": "hotel", "key": "hero", "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920", "alt": {"fr": "Hôtel", "de": "Hotel", "en": "Hotel"}, "type": "image"},
    ]
    await db.site_images.insert_many(site_images)
    
    # Create site texts
    print("Creating site texts...")
    site_texts = [
        {"id": str(uuid.uuid4()), "page": "home", "key": "hero_title", "content": {"fr": "Beni Golf & Hôtel", "de": "Beni Golf & Hotel", "en": "Beni Golf & Hotel"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "hero_subtitle", "content": {"fr": "Une expérience gastronomique d'exception au cœur du Luxembourg", "de": "Ein außergewöhnliches gastronomisches Erlebnis im Herzen Luxemburgs", "en": "An exceptional gastronomic experience in the heart of Luxembourg"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "intro_title", "content": {"fr": "Bienvenue", "de": "Willkommen", "en": "Welcome"}},
        {"id": str(uuid.uuid4()), "page": "home", "key": "intro_text", "content": {"fr": "Niché au cœur de Clervaux, notre établissement vous invite à découvrir une cuisine raffinée dans un cadre exceptionnel.", "de": "Im Herzen von Clervaux gelegen, lädt unser Haus Sie ein, eine raffinierte Küche in einem außergewöhnlichen Rahmen zu entdecken.", "en": "Nestled in the heart of Clervaux, our establishment invites you to discover refined cuisine in an exceptional setting."}},
        {"id": str(uuid.uuid4()), "page": "story", "key": "title", "content": {"fr": "Notre Histoire", "de": "Unsere Geschichte", "en": "Our Story"}},
        {"id": str(uuid.uuid4()), "page": "story", "key": "content", "content": {"fr": "C'est avec passion et dévouement que nous avons créé ce lieu unique.", "de": "Mit Leidenschaft und Hingabe haben wir diesen einzigartigen Ort geschaffen.", "en": "With passion and dedication, we created this unique place."}},
    ]
    await db.site_texts.insert_many(site_texts)
    
    # Create gallery images
    print("Creating gallery images...")
    gallery = [
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", "alt": {"fr": "Restaurant", "de": "Restaurant", "en": "Restaurant"}, "order": 1},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", "alt": {"fr": "Intérieur", "de": "Innenraum", "en": "Interior"}, "order": 2},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", "alt": {"fr": "Golf", "de": "Golf", "en": "Golf"}, "order": 3},
        {"id": str(uuid.uuid4()), "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", "alt": {"fr": "Hôtel", "de": "Hotel", "en": "Hotel"}, "order": 4},
    ]
    await db.gallery.insert_many(gallery)
    
    # Create settings
    print("Creating settings...")
    settings = [
        {"id": str(uuid.uuid4()), "key": "phone", "value": "+352 92 93 94"},
        {"id": str(uuid.uuid4()), "key": "email", "value": "info@benigolfhotel.lu"},
        {"id": str(uuid.uuid4()), "key": "address", "value": "1 Route du Golf, L-9749 Clervaux, Luxembourg"},
        {"id": str(uuid.uuid4()), "key": "slogan", "value": {"fr": "Une expérience gastronomique d'exception", "de": "Ein außergewöhnliches gastronomisches Erlebnis", "en": "An exceptional gastronomic experience"}},
    ]
    await db.settings.insert_many(settings)
    
    print("\n✅ Database seeded successfully!")
    print("Admin login: admin@benigolfhotel.lu / admin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
