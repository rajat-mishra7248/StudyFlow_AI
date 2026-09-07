from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.study_timer import StudyTimer


class StudyTimerRepository:

    @staticmethod
    def create(db: Session, timer: StudyTimer):
        db.add(timer)
        db.commit()
        db.refresh(timer)
        return timer

    @staticmethod
    def get_all(db: Session, student_id: int):
        statement = (
            select(StudyTimer)
            .where(StudyTimer.student_id == student_id)
            .order_by(StudyTimer.started_at.desc())
        )

        return list(db.execute(statement).scalars().all())

    @staticmethod
    def get_by_id(
        db: Session,
        timer_id: int,
        student_id: int,
    ):
        statement = (
            select(StudyTimer)
            .where(
                StudyTimer.id == timer_id,
                StudyTimer.student_id == student_id,
            )
        )

        return db.execute(statement).scalar_one_or_none()

    @staticmethod
    def update(
        db: Session,
        timer: StudyTimer,
    ):
        db.add(timer)
        db.commit()
        db.refresh(timer)
        return timer