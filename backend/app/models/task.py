from app.db.base import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class Task(Base):
    __tablename__ = "Task"

    id = Column(Integer, primary_key = True)
    project_id = Column(Integer, ForeignKey("Project.id"), nullable = False)
    assignee_id = Column(Integer, ForeignKey("User.id"), nullable = False)
    title = Column(String(255), unique = False, nullable = False)
    status = Column(String(11), nullable = False, default = "To-do")
    priority = Column(String(6), nullable = False, default = "Medium")

    project = relationship("Project", back_populates = "tasks")
    assignee = relationship("User", back_populates = "tasks")
    comments = relationship("Comment", back_populates = "task")