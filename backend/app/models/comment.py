from app.db.base import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class Comment(Base):
    __tablename__ = "Comment"

    id = Column(Integer, primary_key = True)
    task_id = Column(Integer, ForeignKey("Task.id"), nullable = False)
    user_id = Column(Integer, ForeignKey("User.id"), nullable = False)
    content = Column(String(255), unique = False, nullable = True)

    task = relationship("Task", back_populates = "comments")
    user = relationship("User", back_populates = "comments")