from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.settings import settings
from app.database.init_db import create_database
from app.api.v1.courses import router as courses_router
from app.api.v1 import ai_timetable
from app.api.v1.timetable import router as timetable_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE STARTUP
# =========================================================

@app.on_event("startup")
async def startup_event():
    create_database()


# =========================================================
# API ROUTERS
# =========================================================

app.include_router(api_router)
app.include_router(courses_router)
app.include_router(ai_timetable.router)

# =========================================================
# HOME
# =========================================================

@app.get("/", tags=["Home"])
async def home():
    return {
        "message": "Welcome to StudyFlow AI 🚀",
        "status": "Running Successfully",
        "version": settings.app_version,
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "Healthy"
    }