from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)
from app.security.dependencies import (
    get_current_student,
)
from app.serivces.revision_service import (
    RevisionService,
)

router = APIRouter(
    prefix="/revision",
    tags=["Revision"],
)


@router.get("")
def revision(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    return RevisionService.get_revision_plan(
        quizzes,
    )