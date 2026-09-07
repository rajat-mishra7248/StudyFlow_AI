from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.schemas.study_timer import (
    StudyTimerCreate,
    StudyTimerUpdate,
    StudyTimerResponse,
)
from app.security.dependencies import (
    get_current_student,
)
from app.serivces.study_timer_service import (
    StudyTimerService,
)


router = APIRouter(
    prefix="/study-timers",
    tags=["Study Timer"],
)


# ==========================================
# START / CREATE STUDY TIMER
# ==========================================

@router.post(
    "",
    response_model=StudyTimerResponse,
)
def start_timer(
    data: StudyTimerCreate,
    db: Session = Depends(get_database),
    student: Student = Depends(
        get_current_student
    ),
):
    return StudyTimerService.create(
        db,
        student,
        data,
    )


# ==========================================
# GET STUDY TIMER HISTORY
# ==========================================

@router.get(
    "",
    response_model=list[StudyTimerResponse],
)
def get_timer_history(
    db: Session = Depends(get_database),
    student: Student = Depends(
        get_current_student
    ),
):
    return StudyTimerService.get_all(
        db,
        student,
    )


# ==========================================
# FINISH STUDY TIMER
# ==========================================

@router.put(
    "/{timer_id}/finish",
    response_model=StudyTimerResponse,
)
def finish_timer(
    timer_id: int,
    data: StudyTimerUpdate,
    db: Session = Depends(get_database),
    student: Student = Depends(
        get_current_student
    ),
):
    return StudyTimerService.finish(
        db,
        student,
        timer_id,
        data,
    )