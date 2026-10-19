from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine

from app.models.user import User
from app.models.project import Project
from app.models.members import ProjectMember
from app.models.task import Task
from app.models.comment import Comment

from app.api.v1 import health
from app.api.v1 import auth
from app.api.v1 import user
from app.api.v1 import projects
from app.api.v1 import members

Base.metadata.create_all(bind = engine)

app = FastAPI()

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(projects.router)
app.include_router(members.router)