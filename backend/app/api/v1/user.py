from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt

from app.db.session import SessionLocal
from app.models.user import User
from app.core.dependencies import get_db, get_current_user
from app.schema.auth import UserRegisterResponse
from app.schema.user import RenameRequest, ChangePasswordRequest

router = APIRouter(
    prefix = "/api/v1/users",
    tags = ["Users"]
)

@router.get("/me", response_model = UserRegisterResponse)
def profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.patch("/me", response_model = UserRegisterResponse)
def rename(
    request: RenameRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user.name = request.name

    db.commit()
    db.refresh(current_user)

    return current_user

@router.patch("/me/password")
def changePassword(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not bcrypt.checkpw(
        request.current_password.encode("utf-8"),
        current_user.password_hash.encode("utf-8")
    ):
        raise HTTPException(
            status_code = 400,
            detail = "Current password is incorrect."
        )

    new_password_hash = bcrypt.hashpw(
        request.new_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    current_user.password_hash = new_password_hash

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Password updated successfully."
    }