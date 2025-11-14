from pydantic import BaseModel, EmailStr
from typing import Optional

class UserModel(BaseModel):
    email: EmailStr
    password: str
    fullName: Optional[str] = None
