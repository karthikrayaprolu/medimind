from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from db.mongo import sync_users
from auth.hash import hash_password, verify_password
from auth.sessions import create_session, get_user_from_session, delete_session
from bson import ObjectId
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter()

# Pydantic models
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    fullName: str = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class FcmTokenUpdate(BaseModel):
    fcm_token: str

# Helper to get session from cookie or Authorization header
def get_session_id_from_request(request: Request) -> str | None:
    """Get session ID from cookie or Authorization header"""
    # First try cookie (for web)
    session_id = request.cookies.get("session_id")
    if session_id:
        return session_id
    
    # Then try Authorization header (for mobile apps)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]  # Remove "Bearer " prefix
    
    return None

# Middleware for protected routes
async def require_user(request: Request):
    session_id = get_session_id_from_request(request)
    if not session_id:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = await get_user_from_session(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Session expired")

    return user_id


@router.post("/signup")
async def signup(user: UserSignup):
    try:
        # Check if user exists
        existing = sync_users.find_one({"email": user.email})
        if existing:
            return JSONResponse({"error": "User already exists"}, status_code=400)

        # Hash password
        user_doc = {
            "email": user.email,
            "password": hash_password(user.password),
            "fullName": user.fullName,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "fcm_token": None  # For push notifications
        }

        # Insert user
        result = sync_users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # Create session
        session_id = await create_session(user_id)

        # Return session_id in body for mobile apps (Authorization header)
        response = JSONResponse({
            "success": True,
            "message": "Signup successful",
            "user_id": user_id,
            "email": user.email,
            "session_id": session_id  # For mobile apps
        })
        # Also set cookie for web apps
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=604800  # 7 days
        )

        return response
    
    except Exception as e:
        print(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def login(data: UserLogin):
    try:
        user = sync_users.find_one({"email": data.email})
        if not user:
            return JSONResponse({"error": "Invalid credentials"}, status_code=401)
        
        if not verify_password(data.password, user["password"]):
            return JSONResponse({"error": "Invalid credentials"}, status_code=401)

        # Update last login
        sync_users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Create Redis session
        session_id = await create_session(str(user["_id"]))

        # Return session_id in body for mobile apps (Authorization header)
        response = JSONResponse({
            "success": True,
            "message": "Login successful",
            "user_id": str(user["_id"]),
            "email": user["email"],
            "fullName": user.get("fullName"),
            "session_id": session_id  # For mobile apps
        })
        # Also set cookie for web apps
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=604800
        )

        return response
    
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout(request: Request):
    session_id = get_session_id_from_request(request)
    if session_id:
        await delete_session(session_id)

    response = JSONResponse({"message": "Logged out", "success": True})
    response.delete_cookie("session_id")
    return response


@router.post("/fcm-token")
async def update_fcm_token(data: FcmTokenUpdate, user_id: str = Depends(require_user)):
    """Update user's FCM token for push notifications"""
    try:
        sync_users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"fcm_token": data.fcm_token, "fcm_updated_at": datetime.utcnow()}}
        )
        return {"success": True, "message": "FCM token updated"}
    except Exception as e:
        print(f"FCM token update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me")
async def me(user_id: str = Depends(require_user)):
    try:
        user = sync_users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "fullName": user.get("fullName"),
            "created_at": user.get("created_at")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
