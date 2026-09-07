from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.timetable import Timetable
from app.repositories.timetable_repository import TimetableRepository
from app.schemas.timetable import (
    TimetableCreate,
    TimetableUpdate,
)


class TimetableService:

    @staticmethod
    def create(
        db: Session,
        student: Student,
        data: TimetableCreate,
    ):

        timetable = Timetable(
            student_id=student.id,
            subject=data.subject,
            day=data.day,
            start_time=data.start_time,
            end_time=data.end_time,
            priority=data.priority,
        )

        return TimetableRepository.create(
            db,
            timetable,
        )

    @staticmethod
    def get_all(
        db: Session,
        student: Student,
    ):
        return TimetableRepository.get_all(
            db,
            student.id,
        )

    @staticmethod
    def get_one(
        db: Session,
        student: Student,
        timetable_id: int,
    ):
        timetable = TimetableRepository.get_by_id(
            db,
            timetable_id,
            student.id,
        )

        if not timetable:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Timetable not found",
            )

        return timetable

    @staticmethod
    def update(
        db: Session,
        student: Student,
        timetable_id: int,
        data: TimetableUpdate,
    ):
        timetable = TimetableService.get_one(
            db,
            student,
            timetable_id,
        )

        timetable.subject = data.subject
        timetable.day = data.day
        timetable.start_time = data.start_time
        timetable.end_time = data.end_time
        timetable.priority = data.priority
        timetable.completed = data.completed

        return TimetableRepository.update(
            db,
            timetable,
        )

    @staticmethod
    def delete(
        db: Session,
        student: Student,
        timetable_id: int,
    ):
        timetable = TimetableService.get_one(
            db,
            student,
            timetable_id,
        )

        TimetableRepository.delete(
            db,
            timetable,
        )

        return {
            "message": "Timetable deleted successfully"
        }