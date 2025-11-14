from pydantic import BaseModel

class SessionModel(BaseModel):
    session_id: str
    user_id: str
