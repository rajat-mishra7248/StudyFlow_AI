from fastapi import APIRouter

from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.ai_timetable import router as ai_timetable_router


router = APIRouter()


router.include_router(
    dashboard_router
)

router.include_router(
    ai_timetable_router
)