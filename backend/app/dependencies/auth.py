from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings
from app.services.local_auth import decode_access_token, get_user_by_id

security = HTTPBearer(auto_error=False)


@dataclass
class AuthUser:
    id: str
    email: str | None = None


def _decode_supabase_token(token: str) -> AuthUser:
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=503,
            detail="Supabase authentication is not configured (SUPABASE_JWT_SECRET).",
        )

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    return AuthUser(id=user_id, email=payload.get("email"))


def _decode_local_token(token: str) -> AuthUser:
    try:
        user = decode_access_token(token)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    record = get_user_by_id(user["id"])
    if record is None:
        raise HTTPException(status_code=401, detail="User not found.")

    return AuthUser(id=record["id"], email=record["email"])


def _decode_token(token: str) -> AuthUser:
    if settings.auth_mode == "supabase":
        return _decode_supabase_token(token)
    return _decode_local_token(token)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated.")

    return _decode_token(credentials.credentials)
