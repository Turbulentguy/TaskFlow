from app.db.base import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Task(Base):
    __tablename__ = "Task"

    id = Column(Integer, primary_key = True)
    project_id = Column(Integer, ForeignKey("Project.id"), nullable = False)
    assignee_id = Column(Integer, ForeignKey("User.id"), nullable = True)
    title = Column(String(255), unique = False, nullable = False)
    description = Column(Text, nullable = True)
    status = Column(String(20), nullable = False)
    priority = Column(String(20), nullable = False)
    due_date = Column(DateTime, nullable = True)
    created_by = Column(Integer, ForeignKey("User.id"), nullable = False)
    created_at = Column(DateTime, server_default = func.now(), nullable = False)
    updated_at = Column(DateTime, server_default = func.now(), onupdate = func.now(), nullable = False)


    project = relationship("Project", back_populates = "tasks")
    assignee = relationship("User", back_populates = "task_assignee", foreign_keys = [assignee_id])
    creator = relationship("User", back_populates = "task_creator", foreign_keys = [created_by])
    comments = relationship("Comment", back_populates = "task")