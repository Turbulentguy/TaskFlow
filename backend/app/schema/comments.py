from pydantic import BaseModel
from datetime import datetime

class CommentCreateRequest(BaseModel):
    content: str

class CommentCreateResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: datetime

    class Config():
        from_attributes = True

class CommentGetResponse(BaseModel):
    items: list[CommentCreateResponse]
    total: int
    page: int
    page_size: int