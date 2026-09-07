from fastapi import APIRouter, Depends

from app.models.student import Student
from app.security.dependencies import get_current_student
from app.serivces.scheduler_service import SchedulerService

router = APIRouter(
    prefix="/scheduler",
    tags=["Scheduler"],
)


@router.get("")
def get_schedule(
    current_student: Student = Depends(
        get_current_student,
    ),
):

    return SchedulerService.generate_schedule(
        current_student,
    )