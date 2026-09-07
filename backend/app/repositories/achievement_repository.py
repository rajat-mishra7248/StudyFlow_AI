from sqlalchemy.orm import Session

from app.models.achievement import Achievement


class AchievementRepository:

    @staticmethod
    def create(
        db: Session,
        achievement: Achievement,
    ):

        db.add(
            achievement,
        )

        db.commit()

        db.refresh(
            achievement,
        )

        return achievement

    @staticmethod
    def get_all(
        db: Session,
        student,
    ):

        return (
            db.query(
                Achievement,
            )
            .filter(
                Achievement.student_id == student.id,
            )
            .all()
        )