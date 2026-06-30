from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import audio, auth, health, languages, translate
from app.services.database import init_db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if settings.auth_mode == "local":
        init_db()
    yield


app = FastAPI(
    title="Transapp API",
    description="FastAPI backend for the Transapp translation UI",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(languages.router)
app.include_router(audio.router)
app.include_router(translate.router)
