from app.db.base import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Comment(Base):
    __tablename__ = "Comment"

    id = Column(Integer, primary_key = True)
    task_id = Column(Integer, ForeignKey("Task.id"), nullable = False)
    user_id = Column(Integer, ForeignKey("User.id"), nullable = False)
    content = Column(Text, unique = False, nullable = True)
    created_at = Column(DateTime, server_default = func.now(), nullable = False)
    updated_at = Column(DateTime, server_default = func.now(), onupdate = func.now(), nullable = False)

    task = relationship("Task", back_populates = "comments")
    user = relationship("User", back_populates = "comments")