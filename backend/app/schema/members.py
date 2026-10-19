from pydantic import BaseModel, EmailStr
from datetime import datetime

class MembersPostRequest(BaseModel):
    email: EmailStr

class MemberPostResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    role: str
    joined_at: datetime

    class Config():
        from_attributes = True

class MemberListResponse(BaseModel):
    items: list[MemberPostResponse]
    total: int