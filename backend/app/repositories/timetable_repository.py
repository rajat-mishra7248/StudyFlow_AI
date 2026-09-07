from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.timetable import Timetable


class TimetableRepository:

    @staticmethod
    def create(db: Session, timetable: Timetable):
        db.add(timetable)
        db.commit()
        db.refresh(timetable)
        return timetable

    @staticmethod
    def get_all(db: Session, student_id: int):
        statement = (
            select(Timetable)
            .where(Timetable.student_id == student_id)
            .order_by(
                Timetable.day,
                Timetable.start_time,
            )
        )

        return list(
            db.execute(statement).scalars().all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        timetable_id: int,
        student_id: int,
    ):
        statement = (
            select(Timetable)
            .where(
                Timetable.id == timetable_id,
                Timetable.student_id == student_id,
            )
        )

        return db.execute(statement).scalar_one_or_none()

    @staticmethod
    def update(
        db: Session,
        timetable: Timetable,
    ):
        db.add(timetable)
        db.commit()
        db.refresh(timetable)
        return timetable

    @staticmethod
    def delete(
        db: Session,
        timetable: Timetable,
    ):
        db.delete(timetable)
        db.commit()