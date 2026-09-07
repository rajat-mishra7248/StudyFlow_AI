from fastapi import APIRouter, Depends

from app.models.student import Student
from app.schemas.ai_timetable import (
    AITimetableRequest,
    AITimetableResponse,
)
from app.security.dependencies import get_current_student
from app.serivces.ai_timetable_service import (
    AITimetableService,
)


router = APIRouter(
    prefix="/ai/timetable",
    tags=["AI Timetable"],
)


@router.post(
    "",
    response_model=AITimetableResponse,
)
def generate_ai_timetable(
    data: AITimetableRequest,
    current_student: Student = Depends(
        get_current_student
    ),
):

    return AITimetableService.generate(
        data
    )