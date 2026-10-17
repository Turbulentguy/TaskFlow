from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import bcrypt

from app.db.session import SessionLocal
from app.schema.auth import UserRegister, UserRegisterResponse, LoginResponse
from app.services.auth_service import create_access_token
from app.core.dependencies import get_current_user

from app.models.user import User

router = APIRouter(
    prefix = "/api/v1/auth",
    tags = ["Authentication"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model = UserRegisterResponse, status_code = 201)
def Register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    existingEmail = db.query(User).filter(
        User.email == user.email
    ).first()

    if existingEmail:
        raise HTTPException(
            status_code = 409,
            detail = "Email already existed."
        )

    password_hash = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    new_user = User(
        name = user.name,
        email = user.email,
        password_hash = password_hash
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model = LoginResponse)
def Login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if db_user is None or not bcrypt.checkpw(
        form_data.password.encode("utf-8"),
        db_user.password_hash.encode("utf-8")
    ):
        raise HTTPException(
            status_code = 401,
            detail = "Invalid email or password."
        )

    access_token = create_access_token(
        data = {"sub": str(db_user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.get("/me", response_model = UserRegisterResponse)
def GetCurrentUser(
    current_user: User = Depends(get_current_user)
):
    return current_user