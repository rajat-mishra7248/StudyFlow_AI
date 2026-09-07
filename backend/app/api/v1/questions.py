from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student

from app.security.dependencies import (
    get_current_student
)

from app.serivces.question_service import (
    QuestionService
)


router = APIRouter(
    prefix="/questions",
    tags=["Questions"],
)


# ============================================================
# GET QUESTIONS BY QUIZ
# ============================================================

@router.get(
    "/quiz/{quiz_id}",
)
def get_questions_by_quiz(
    quiz_id: int,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):
    return QuestionService.get_by_quiz(
        db,
        quiz_id,
    )


# ============================================================
# GET SINGLE QUESTION
# ============================================================

@router.get(
    "/{question_id}",
)
def get_question(
    question_id: int,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):
    return QuestionService.get_one(
        db,
        question_id,
    )