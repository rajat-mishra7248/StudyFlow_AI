from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_database

from app.models.student import Student

from app.schemas.quiz import (
    QuizCreate,
    QuizResponse,
    QuizUpdate,
    QuizSubmit,
    QuizSubmitResponse,
)

from app.security.dependencies import (
    get_current_student
)

from app.serivces.quiz_service import (
    QuizService
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/quizzes",
    tags=["Quiz"],
)


# ============================================================
# CREATE QUIZ
# ============================================================

@router.post(
    "",
    response_model=QuizResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_quiz(
    quiz: QuizCreate,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):

    return QuizService.create(
        db,
        current_student,
        quiz,
    )


# ============================================================
# GET ALL QUIZZES
# ============================================================

@router.get(
    "",
    response_model=list[QuizResponse],
)
def get_all_quizzes(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):

    return QuizService.get_all(
        db,
        current_student,
    )


# ============================================================
# SUBMIT QUIZ
# ============================================================

@router.post(
    "/submit",
    response_model=QuizSubmitResponse,
)
def submit_quiz(
    data: QuizSubmit,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):

    return QuizService.submit(
        db=db,
        student=current_student,
        data=data,
    )


# ============================================================
# GET SINGLE QUIZ
# ============================================================

@router.get(
    "/{quiz_id}",
    response_model=QuizResponse,
)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):

    return QuizService.get_one(
        db,
        current_student,
        quiz_id,
    )


# ============================================================
# UPDATE QUIZ
# ============================================================

@router.put(
    "/{quiz_id}",
    response_model=QuizResponse,
)
def update_quiz(
    quiz_id: int,
    quiz: QuizUpdate,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):

    return QuizService.update(
        db,
        current_student,
        quiz_id,
        quiz,
    )


# ============================================================
# DELETE QUIZ
# ============================================================

@router.delete(
    "/{quiz_id}",
)
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):

    return QuizService.delete(
        db,
        current_student,
        quiz_id,
    )