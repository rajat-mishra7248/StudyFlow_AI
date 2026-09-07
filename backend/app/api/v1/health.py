from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_database

router = APIRouter(
    prefix="/system",
    tags=["System"],
)


@router.get("/health")
def system_health(
    db: Session = Depends(get_database),
):
    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
            "application": "StudyFlow AI",
            "message": "All core systems are operational",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "application": "StudyFlow AI",
            "error": str(e),
        }