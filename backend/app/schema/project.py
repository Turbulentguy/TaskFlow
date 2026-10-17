from pydantic import BaseModel
from datetime import datetime

class ProjectCreateRequest(BaseModel):
    name: str
    description: str

class ProjectCreateResponse(BaseModel):
    id: int
    name: str
    description: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config():
        from_attributes = True

class GetProjectsResponse(BaseModel):
    items: list[ProjectCreateResponse]
    total: int
    page: int
    page_size: int