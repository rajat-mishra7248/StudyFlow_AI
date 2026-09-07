from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.schemas.recommendation import (
    RecommendationResponse,
)
from app.security.dependencies import (
    get_current_student,
)
from app.serivces.recommendation_service import (
    RecommendationService,
)

router = APIRouter(
    prefix="/recommendation",
    tags=["AI Recommendation"],
)


@router.get(
    "",
    response_model=RecommendationResponse,
)
def recommendation(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    return RecommendationService.generate(
        db,
        current_student,
    )