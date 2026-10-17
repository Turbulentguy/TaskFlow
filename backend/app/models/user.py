from app.db.base import Base
from sqlalchemy import (
    Column, 
    Integer, 
    String,
    DateTime
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "User"

    id = Column(Integer, primary_key = True)
    name = Column(String(255), unique = False, nullable = False)
    email = Column(String(255), unique = True, nullable = False)
    password_hash = Column(String(255), unique = False, nullable = False)
    created_at = Column(DateTime, server_default = func.now())

    projects = relationship("Project", back_populates = "user")
    tasks = relationship("Task", back_populates = "assignee")
    comments = relationship("Comment", back_populates = "user")
    project_members = relationship("ProjectMember", back_populates = "member")