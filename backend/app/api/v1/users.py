from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.schemas.student import StudentProfileUpdate, StudentResponse
from app.security.dependencies import get_current_student
from app.serivces.student_service import StudentService

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


@router.get(
    "/me",
    response_model=StudentResponse,
)
def get_profile(
    current_student: Student = Depends(get_current_student),
):
    return current_student


@router.put(
    "/me",
    response_model=StudentResponse,
)
def update_profile(
    profile: StudentProfileUpdate,
    db: Session = Depends(get_database),
    current_student: Student = Depends(get_current_student),
):

    return StudentService.update_profile(
        db=db,
        current_student=current_student,
        profile=profile,
    )