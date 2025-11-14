import uuid
from typing import Dict, Optional
from datetime import datetime, timedelta

# In-memory session storage (fallback when Redis is unavailable)
# For production, use Redis
_memory_sessions: Dict[str, tuple[str, datetime]] = {}

SESSION_EXPIRE_SECONDS = 60 * 60 * 24 * 7   # 7 days

def _cleanup_expired_sessions():
    """Remove expired sessions from memory"""
    now = datetime.utcnow()
    expired = [sid for sid, (_, exp) in _memory_sessions.items() if exp < now]
    for sid in expired:
        del _memory_sessions[sid]

async def create_session(user_id: str) -> str:
    """Create a new session (in-memory fallback)"""
    _cleanup_expired_sessions()
    session_id = str(uuid.uuid4())
    expiry = datetime.utcnow() + timedelta(seconds=SESSION_EXPIRE_SECONDS)
    _memory_sessions[session_id] = (user_id, expiry)
    return session_id

async def get_user_from_session(session_id: str) -> Optional[str]:
    """Get user ID from session (in-memory fallback)"""
    _cleanup_expired_sessions()
    session_data = _memory_sessions.get(session_id)
    if not session_data:
        return None
    user_id, expiry = session_data
    if expiry < datetime.utcnow():
        del _memory_sessions[session_id]
        return None
    return user_id

async def delete_session(session_id: str):
    """Delete a session (in-memory fallback)"""
    if session_id in _memory_sessions:
        del _memory_sessions[session_id]
