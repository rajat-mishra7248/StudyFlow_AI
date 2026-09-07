from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_database
from app.models.student import Student
from app.schemas.study_plan import (
    StudyPlanCreate,
    StudyPlanUpdate,
    StudyPlanResponse,
)
from app.security.dependencies import (
    get_current_student,
)
from app.serivces.study_plan_service import (
    StudyPlanService,
)

router = APIRouter(
    prefix="/study-plans",
    tags=["Study Planner"],
)

@router.post(
    "",
    response_model=StudyPlanResponse,
)
def create_plan(
    data: StudyPlanCreate,
    db: Session = Depends(get_database),
    student: Student = Depends(
        get_current_student
    ),
):
    return StudyPlanService.create(
        db,
        student,
        data,
    )

@router.get(
    "",
    response_model=list[StudyPlanResponse],
)
def get_plans(
    db: Session = Depends(get_database),
    student: Student = Depends(
        get_current_student
    ),
):
    return StudyPlanService.get_all(
        db,
        student,
    )

@router.get(
    "/{plan_id}",
    response_model=StudyPlanResponse,
)
def get_study_plan(
    plan_id: int,
    db: Session = Depends(get_database),
    student: Student = Depends(get_current_student),
):
    return StudyPlanService.get_one(
        db,
        student,
        plan_id,
    )

@router.put(
    "/{plan_id}",
    response_model=StudyPlanResponse,
)
def update_study_plan(
    plan_id: int,
    data: StudyPlanUpdate,
    db: Session = Depends(get_database),
    student: Student = Depends(get_current_student),
):
    return StudyPlanService.update(
        db,
        student,
        plan_id,
        data,
    )

@router.delete(
    "/{plan_id}",
)
def delete_study_plan(
    plan_id: int,
    db: Session = Depends(get_database),
    student: Student = Depends(get_current_student),
):
    return StudyPlanService.delete(
        db,
        student,
        plan_id,
    )