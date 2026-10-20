from pydantic import BaseModel
from datetime import datetime
from typing import Literal

class TaskCreateRequest(BaseModel):
    title: str
    description: str | None = None
    status: Literal["todo", "in_progress", "done"] = "todo"
    priority: Literal["Low", "Medium", "High"] = "Medium"
    assignee_id: int | None = None
    due_date: datetime | None = None

class TaskCreateResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    status: str
    priority: str
    assignee_id: int | None
    due_date: datetime | None
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config():
        from_attributes = True

class TaskGetResponse(BaseModel):
    items: list[TaskCreateResponse]
    total: int
    page: int
    page_size: int

class TaskUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Literal["todo", "in_progress", "done"] | None = None
    priority: Literal["Low", "Medium", "High"] | None = None
    assignee_id: int | None = None
    due_date: datetime | None = None