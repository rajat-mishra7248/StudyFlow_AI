from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.study_timer import StudyTimer
from app.repositories.study_timer_repository import StudyTimerRepository
from app.schemas.study_timer import (
    StudyTimerCreate,
    StudyTimerUpdate,
)

class StudyTimerService:

    # ============================================================
    # CREATE / START STUDY TIMER
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        student: Student,
        data: StudyTimerCreate,
    ):
        # Duration must be positive.
        if data.study_duration <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Study duration must be greater than 0 minutes.",
            )

        # Break duration cannot be negative.
        if data.break_duration < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Break duration cannot be negative.",
            )

        timer = StudyTimer(
            student_id=student.id,
            study_duration=data.study_duration,
            break_duration=data.break_duration,
            completed=False,
        )

        return StudyTimerRepository.create(
            db,
            timer,
        )

    # ============================================================
    # GET STUDY TIMER HISTORY
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        student: Student,
    ):
        return StudyTimerRepository.get_all(
            db,
            student.id,
        )

    # ============================================================
    # FINISH STUDY TIMER
    # ============================================================

    @staticmethod
    def finish(
        db: Session,
        student: Student,
        timer_id: int,
        data: StudyTimerUpdate,
    ):
        timer = StudyTimerRepository.get_by_id(
            db,
            timer_id,
            student.id,
        )

        if timer is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study timer not found.",
            )

        # Prevent changing an already completed session.
        if bool(
            getattr(
                timer,
                "completed",
                False,
            )
        ):
            return timer

        timer.completed = bool(
            data.completed
        )

        timer.ended_at = (
            data.ended_at
            or datetime.utcnow()
        )

        return StudyTimerRepository.update(
            db,
            timer,
        )