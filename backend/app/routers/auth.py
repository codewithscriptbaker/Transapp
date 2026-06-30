from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.dependencies.auth import AuthUser, get_current_user
from app.models.schemas import AuthResponse, LoginRequest, SignUpRequest, UserResponse
from app.services.local_auth import authenticate_user, create_access_token, create_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.get("/config")
async def get_auth_config() -> dict[str, str]:
    return {"mode": settings.auth_mode}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: AuthUser = Depends(get_current_user)) -> UserResponse:
    return UserResponse(id=current_user.id, email=current_user.email)


@router.post("/signup", response_model=AuthResponse)
async def sign_up(body: SignUpRequest) -> AuthResponse:
    if settings.auth_mode != "local":
        raise HTTPException(
            status_code=400,
            detail="Local sign-up is disabled. Configure Supabase or set AUTH_PROVIDER=local.",
        )

    try:
        user = create_user(body.email, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    token = create_access_token(user["id"], user["email"])
    return AuthResponse(
        access_token=token,
        user=UserResponse(id=user["id"], email=user["email"]),
    )


@router.post("/login", response_model=AuthResponse)
async def log_in(body: LoginRequest) -> AuthResponse:
    if settings.auth_mode != "local":
        raise HTTPException(
            status_code=400,
            detail="Local login is disabled. Use Supabase sign-in instead.",
        )

    user = authenticate_user(body.email, body.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user["id"], user["email"])
    return AuthResponse(
        access_token=token,
        user=UserResponse(id=user["id"], email=user["email"]),
    )
