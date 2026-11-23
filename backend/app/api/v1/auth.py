from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import bcrypt
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv

from app.db.session import SessionLocal
from app.schema.auth import UserRegister, UserRegisterResponse, LoginResponse
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    decode_refresh_token
)

from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.refresh_token import RefreshToken


load_dotenv()

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
    response: Response,
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

    refresh_token = create_refresh_token(
        data = {"sub": str(db_user.id)}
    )

    token_hash = hash_refresh_token(refresh_token)

    expires_at = datetime.now(timezone.utc) + timedelta(
        days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    )

    new_refresh_token = RefreshToken(
        user_id = db_user.id,
        token_hash = token_hash,
        expires_at = expires_at
    )

    db.add(new_refresh_token)
    db.commit()

    response.set_cookie(
        key = "refresh_token",
        value = refresh_token,
        httponly = True,
        secure = os.getenv("COOKIE_SECURE", "false").lower() == "true",
        samesite = "none" if os.getenv("COOKIE_SECURE", "false").lower() == "true" else "lax",
        max_age = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")) * 86400,
        path = "/api/v1/auth"
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

@router.post("/refresh")
def Refresh(
    response: Response,
    refresh_token: str = Cookie(default = None),
    db: Session = Depends(get_db)
):
    if refresh_token is None:
        raise HTTPException(
            status_code = 401,
            detail = "Refresh token not found."
        )

    try:
        payload = decode_refresh_token(refresh_token)
        user_id = int(payload.get("sub"))

    except Exception:
        raise HTTPException(
            status_code = 401,
            detail = "Invalid or expired refresh token"
        )

    token_hash = hash_refresh_token(refresh_token)

    db_refresh_token = db.query(RefreshToken).filter(
        (RefreshToken.token_hash == token_hash) &
        (RefreshToken.user_id == user_id) &
        (RefreshToken.revoked == False)
    ).first()

    if db_refresh_token is None:
        raise HTTPException(
            status_code=401,
            detail="Refresh token is invalid or revoked."
        )

    if db_refresh_token.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=401,
            detail="Refresh token has expired."
        )

    db_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found."
        )

    db_refresh_token.revoked = True

    new_access_token = create_access_token(
        data = {"sub": str(db_user.id)}
    )

    new_refresh_token = create_refresh_token(
        data = {"sub": str(db_user.id)}
    )

    new_token_hash = hash_refresh_token(new_refresh_token)

    expires_at = datetime.now(timezone.utc) + timedelta(
        days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    )

    new_refresh_token_record = RefreshToken(
        user_id = db_user.id,
        token_hash = new_token_hash,
        expires_at = expires_at
    )

    db.add(new_refresh_token_record)
    db.commit()

    response.set_cookie(
        key = "refresh_token",
        value = new_refresh_token,
        httponly = True,
        secure = os.getenv("COOKIE_SECURE", "false").lower() == "true",
        samesite = "none" if os.getenv("COOKIE_SECURE", "false").lower() == "true" else "lax",
        max_age = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")) * 86400,
        path = "/api/v1/auth"
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def Logout(
    response: Response,
    refresh_token: str = Cookie(default = None),
    db: Session = Depends(get_db)
):
    if refresh_token:
        token_hash = hash_refresh_token(refresh_token)

        db_token = db.query(RefreshToken).filter(
            (RefreshToken.token_hash == token_hash) &
            (RefreshToken.revoked == False)
        ).first()

        if db_token:
            db_token.revoked = True
            db.commit()

    response.delete_cookie(
        key = "refresh_token",
        path = "/api/v1/auth",
        secure = os.getenv("COOKIE_SECURE", "false").lower() == "true",
        httponly = True,
        samesite = "none" if os.getenv("COOKIE_SECURE", "false").lower() == "true" else "lax"
    )

    return {
        "message": "Logged out successfully"
    }