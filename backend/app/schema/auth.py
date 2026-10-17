from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserRegisterResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config():
        from_attributes = True

class UserLoginResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config():
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserLoginResponse