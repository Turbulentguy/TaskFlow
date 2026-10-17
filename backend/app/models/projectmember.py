from app.db.base import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class ProjectMember(Base):
    __tablename__ = "ProjectMember"

    project_id = Column(Integer, ForeignKey("Project.id"), primary_key = True)
    user_id = Column(Integer, ForeignKey("User.id"), primary_key = True)
    role = Column(String, unique = False, nullable = False)

    project = relationship("Project", back_populates = "project_members")
    member = relationship("User", back_populates = "project_members")