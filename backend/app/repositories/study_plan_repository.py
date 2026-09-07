from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.study_plan import StudyPlan


class StudyPlanRepository:

    @staticmethod
    def create(db: Session, study_plan: StudyPlan) -> StudyPlan:
        db.add(study_plan)
        db.commit()
        db.refresh(study_plan)
        return study_plan

    @staticmethod
    def get_all(db: Session, student_id: int):
        statement = (
            select(StudyPlan)
            .where(StudyPlan.student_id == student_id)
            .order_by(StudyPlan.id.desc())
        )
        return db.execute(statement).scalars().all()

    @staticmethod
    def get_by_id(
        db: Session,
        plan_id: int,
        student_id: int,
    ):
        statement = (
            select(StudyPlan)
            .where(
                StudyPlan.id == plan_id,
                StudyPlan.student_id == student_id,
            )
        )

        return db.execute(statement).scalar_one_or_none()

    @staticmethod
    def update(
        db: Session,
        study_plan: StudyPlan,
    ):
        db.commit()
        db.refresh(study_plan)
        return study_plan

    @staticmethod
    def delete(
        db: Session,
        study_plan: StudyPlan,
    ):
        db.delete(study_plan)
        db.commit()