from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student

from app.security.dependencies import (
    get_current_student,
)

from app.serivces.progress_service import (
    ProgressService,
)


router = APIRouter(
    prefix="/progress",
    tags=["Progress"],
)


# ============================================================
# GET CURRENT STUDENT PROGRESS
# ============================================================

@router.get("")
def get_progress(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):
    """
    Return complete learning progress
    for the currently authenticated student.
    """

    return ProgressService.report(
        db=db,
        student=current_student,
    )