from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "medimind")

# Async Motor client for FastAPI
async_client = AsyncIOMotorClient(MONGODB_URL)
async_db = async_client[MONGODB_DB_NAME]

# Sync PyMongo client for synchronous operations
sync_client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
sync_db = sync_client[MONGODB_DB_NAME]

# Collections
users_collection = async_db.users
prescriptions_collection = async_db.prescriptions
schedules_collection = async_db.schedules

# Sync collections for compatibility
sync_users = sync_db.users
sync_prescriptions = sync_db.prescriptions
sync_schedules = sync_db.schedules
