from app.db.base import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class ProjectMember(Base):
    __tablename__ = "ProjectMember"

    project_id = Column(Integer, ForeignKey("Project.id"), primary_key = True)
    user_id = Column(Integer, ForeignKey("User.id"), primary_key = True)
    role = Column(String, server_default = "Member", unique = False, nullable = False)
    joined_at = Column(DateTime, server_default = func.now(), nullable = False)

    project = relationship("Project", back_populates = "project_members")
    member = relationship("User", back_populates = "project_members")