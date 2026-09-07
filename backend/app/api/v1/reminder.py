from fastapi import APIRouter, Depends

from app.models.student import Student
from app.security.dependencies import get_current_student
from app.serivces.reminder_service import ReminderService

router = APIRouter(
    prefix="/reminders",
    tags=["Reminder"],
)


@router.get("")
def get_reminders(
    current_student: Student = Depends(
        get_current_student,
    ),
):

    return ReminderService.generate(
        current_student,
    )