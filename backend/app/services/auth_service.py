import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from jose import jwt
import hashlib

load_dotenv()

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    )

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    token = jwt.encode(
        to_encode,
        key = os.getenv("SECRET_KEY"),
        algorithm = os.getenv("ALGORITHM")
    )

    return token

def create_refresh_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    )

    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })

    token = jwt.encode(
        to_encode,
        key = os.getenv("REFRESH_SECRET_KEY"),
        algorithm = os.getenv("ALGORITHM")
    )

    return token

def hash_refresh_token(token: str):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def decode_refresh_token(token: str):
    payload = jwt.decode(
        token,
        key = os.getenv("REFRESH_SECRET_KEY"),
        algorithms = [os.getenv("ALGORITHM")]
    )

    if payload.get("type") != "refresh":
        raise ValueError("Invalid token type.")

    return payload