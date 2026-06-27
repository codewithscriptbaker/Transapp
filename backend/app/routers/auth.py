from fastapi import APIRouter, Depends

from app.dependencies.auth import AuthUser, get_current_user
from app.models.schemas import UserResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: AuthUser = Depends(get_current_user)) -> UserResponse:
    return UserResponse(id=current_user.id, email=current_user.email)
