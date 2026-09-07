from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student

from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)

from app.schemas.achievement import (
    AchievementResponse,
)

from app.security.dependencies import (
    get_current_student,
)

from app.serivces.achievement_service import (
    AchievementService,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/achievement",
    tags=["Achievement"],
)


# ============================================================
# GET ACHIEVEMENTS
# ============================================================

@router.get(
    "",
    response_model=list[AchievementResponse],
)
def get_achievements(
    db: Session = Depends(
        get_database,
    ),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    # --------------------------------------------------------
    # GET ALL QUIZ RESULTS OF CURRENT STUDENT
    # --------------------------------------------------------

    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    # --------------------------------------------------------
    # GENERATE / UPDATE ACHIEVEMENTS
    # --------------------------------------------------------

    return AchievementService.generate(
        db=db,
        student=current_student,
        quizzes=quizzes,
    )