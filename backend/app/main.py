from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import audio, auth, health, languages, translate

app = FastAPI(
    title="Transapp API",
    description="FastAPI backend for the Transapp translation UI",
    version="0.1.0",
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
