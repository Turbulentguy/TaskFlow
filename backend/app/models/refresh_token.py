from app.db.base import Base
from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    String,
    DateTime,
    Boolean
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class RefreshToken(Base):
    __tablename__ = "RefreshToken"

    id = Column(Integer, primary_key = True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete = "CASCADE"), nullable = False, index = True)
    token_hash = Column(String(255), unique = True, nullable = False)
    expires_at = Column(DateTime(timezone = True), nullable = False)
    revoked = Column(Boolean, default = False, nullable = False)
    created_at = Column(DateTime, server_default = func.now())

    user = relationship("User", back_populates = "refresh_tokens")