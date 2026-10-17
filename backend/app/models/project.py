from app.db.base import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class Project(Base):
    __tablename__ = "Project"

    id = Column(Integer, primary_key = True)
    name = Column(String(255), unique = False, nullable = False)
    description = Column(String(255), unique = False, nullable = False)
    owner_id = Column(Integer, ForeignKey("User.id"), nullable = False)

    user = relationship("User", back_populates = "projects")
    project_members = relationship("ProjectMember", back_populates = "project")
    tasks = relationship("Task", back_populates = "project")