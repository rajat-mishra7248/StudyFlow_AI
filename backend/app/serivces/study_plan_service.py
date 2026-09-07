from fastapi import HTTPException, status

from app.models.study_plan import StudyPlan
from app.repositories.study_plan_repository import (
    StudyPlanRepository,
)
from app.schemas.study_plan import (
    StudyPlanCreate,
    StudyPlanUpdate,
)


class StudyPlanService:

    # ==========================================================
    # CREATE STUDY PLAN
    # ==========================================================

    @staticmethod
    def create(
        db,
        student,
        data: StudyPlanCreate,
    ):
        study_plan = StudyPlan(
            student_id=student.id,
            subject=data.subject,
            daily_hours=data.daily_hours,
            start_date=data.start_date,
            end_date=data.end_date,
        )

        return StudyPlanRepository.create(
            db,
            study_plan,
        )

    # ==========================================================
    # GET ALL STUDY PLANS
    # ==========================================================

    @staticmethod
    def get_all(
        db,
        student,
    ):
        return StudyPlanRepository.get_all(
            db,
            student.id,
        )

    # ==========================================================
    # GET ONE STUDY PLAN
    # ==========================================================

    @staticmethod
    def get_one(
        db,
        student,
        plan_id: int,
    ):
        study_plan = StudyPlanRepository.get_by_id(
            db,
            plan_id,
            student.id,
        )

        if not study_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study Plan not found",
            )

        return study_plan

    # ==========================================================
    # UPDATE STUDY PLAN
    # ==========================================================

    @staticmethod
    def update(
        db,
        student,
        plan_id: int,
        data: StudyPlanUpdate,
    ):
        study_plan = StudyPlanService.get_one(
            db,
            student,
            plan_id,
        )

        study_plan.subject = data.subject
        study_plan.daily_hours = data.daily_hours
        study_plan.start_date = data.start_date
        study_plan.end_date = data.end_date
        study_plan.status = data.status
        study_plan.progress = data.progress

        return StudyPlanRepository.update(
            db,
            study_plan,
        )

    # ==========================================================
    # DELETE STUDY PLAN
    # ==========================================================

    @staticmethod
    def delete(
        db,
        student,
        plan_id: int,
    ):
        study_plan = StudyPlanService.get_one(
            db,
            student,
            plan_id,
        )

        StudyPlanRepository.delete(
            db,
            study_plan,
        )

        return {
            "message": "Study Plan deleted successfully",
            "plan_id": plan_id,
        }