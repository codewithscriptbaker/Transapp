from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

security = HTTPBearer(auto_error=False)


@dataclass
class AuthUser:
    id: str
    email: str | None = None


def _decode_supabase_token(token: str) -> AuthUser:
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=503,
            detail="Authentication is not configured on the server (SUPABASE_JWT_SECRET).",
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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated.")

    return _decode_supabase_token(credentials.credentials)
