from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.security.dependencies import get_current_student

from app.repositories.quiz_repository import QuizRepository


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ============================================================
# DASHBOARD
# ============================================================

@router.get("")
def get_dashboard(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):
    # --------------------------------------------------------
    # GET STUDENT QUIZZES
    # --------------------------------------------------------

    quizzes = QuizRepository.get_all(
        db,
        current_student,
    )

    # --------------------------------------------------------
    # TOTAL QUIZZES
    # --------------------------------------------------------

    total_quizzes = len(quizzes)

    # --------------------------------------------------------
    # COMPLETED QUIZZES
    # --------------------------------------------------------

    completed_quizzes = sum(
        1
        for quiz in quizzes
        if getattr(
            quiz,
            "completed",
            False,
        )
    )

    # --------------------------------------------------------
    # TOTAL SCORE
    # --------------------------------------------------------

    total_score = sum(
        getattr(
            quiz,
            "score",
            0,
        ) or 0
        for quiz in quizzes
    )

    # --------------------------------------------------------
    # AVERAGE SCORE
    # --------------------------------------------------------

    average_score = (
        total_score / completed_quizzes
        if completed_quizzes > 0
        else 0
    )

    # --------------------------------------------------------
    # DASHBOARD RESPONSE
    # --------------------------------------------------------

    return {
        "student": {
            "id": current_student.id,
            "name": getattr(
                current_student,
                "full_name",
                "Student",
            ),
        },

        "statistics": {
            "total_quizzes": total_quizzes,
            "completed_quizzes": completed_quizzes,
            "total_score": total_score,
            "average_score": round(
                average_score,
                2,
            ),
        },
    }