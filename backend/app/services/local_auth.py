import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.config import settings
from app.services.database import get_connection

LOCAL_JWT_AUDIENCE = "transapp-local"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_user(email: str, password: str) -> dict[str, str]:
    user_id = str(uuid.uuid4())
    normalized_email = email.strip().lower()
    password_hash = hash_password(password)

    try:
        with get_connection() as conn:
            conn.execute(
                "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
                (user_id, normalized_email, password_hash),
            )
            conn.commit()
    except Exception as exc:
        if "UNIQUE constraint failed" in str(exc):
            raise ValueError("An account with this email already exists.") from exc
        raise

    return {"id": user_id, "email": normalized_email}


def authenticate_user(email: str, password: str) -> dict[str, str] | None:
    normalized_email = email.strip().lower()

    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            (normalized_email,),
        ).fetchone()

    if row is None or not verify_password(password, row["password_hash"]):
        return None

    return {"id": row["id"], "email": row["email"]}


def get_user_by_id(user_id: str) -> dict[str, str] | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, email FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if row is None:
        return None

    return {"id": row["id"], "email": row["email"]}


def create_access_token(user_id: str, email: str) -> str:
    if not settings.jwt_secret:
        raise RuntimeError("JWT_SECRET is not configured for local authentication.")

    expires = datetime.now(UTC) + timedelta(hours=settings.jwt_expire_hours)
    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "email": email,
        "aud": LOCAL_JWT_AUDIENCE,
        "exp": int(expires.timestamp()),
        "iat": int(now.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str) -> dict[str, str]:
    if not settings.jwt_secret:
        raise ValueError("JWT_SECRET is not configured.")

    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=["HS256"],
        audience=LOCAL_JWT_AUDIENCE,
    )
    user_id = payload.get("sub")
    if not user_id:
        raise ValueError("Invalid token payload.")

    return {"id": user_id, "email": payload.get("email")}
