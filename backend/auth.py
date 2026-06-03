from datetime import datetime, timedelta
import base64
import hashlib
import hmac
import os
import secrets
from typing import Iterable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

SECRET_KEY = os.getenv("LAB_SECRET_KEY", "change-this-secret-key-before-public-deploy")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 8 * 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

ROLE_OWNER = "owner"
ROLE_MEMBER = "member"
ROLE_READONLY = "readonly"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        scheme, iterations, salt, digest = hashed_password.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        calculated = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            base64.b64decode(salt),
            int(iterations),
        )
        return hmac.compare_digest(base64.b64encode(calculated).decode("ascii"), digest)
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    iterations = 260_000
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return "$".join(
        [
            "pbkdf2_sha256",
            str(iterations),
            base64.b64encode(salt).decode("ascii"),
            base64.b64encode(digest).decode("ascii"),
        ]
    )


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="登录已过期，请重新登录",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if user is None:
        raise credentials_exception
    return user


def require_roles(roles: Iterable[str]):
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="当前账号无权限执行该操作")
        return current_user

    return checker
