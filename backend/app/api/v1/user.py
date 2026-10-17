from fastapi import APIRouter
from app.db.session import SessionLocal

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

router = APIRouter(
    prefix = "/api/v1/users",
    tags = ["Users"]
)