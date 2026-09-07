from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_database

from app.repositories.course_resource_repository import (
    CourseResourceRepository,
)

from app.schemas.course_resource import (
    CourseResourceCreate,
    CourseResourceResponse,
)

from app.utils.question_seed import (
    seed_python_questions,
)


router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)


# ============================================================
# COURSE RESOURCES
# ============================================================

@router.get(
    "/courses",
    response_model=list[CourseResourceResponse],
)
def get_course_resources(
    db: Session = Depends(get_database),
):
    return CourseResourceRepository.get_all(db)


@router.get(
    "/courses/{course_name}",
    response_model=list[CourseResourceResponse],
)
def get_resources_by_course(
    course_name: str,
    db: Session = Depends(get_database),
):
    return CourseResourceRepository.get_by_course(
        db,
        course_name,
    )


@router.post(
    "/courses",
    response_model=CourseResourceResponse,
)
def create_course_resource(
    data: CourseResourceCreate,
    db: Session = Depends(get_database),
):
    return CourseResourceRepository.create(
        db=db,
        course_name=data.course_name,
        instructor=data.instructor,
        platform=data.platform,
        url=data.url,
        level=data.level,
    )


# ============================================================
# PYTHON QUESTION SEEDING
# ============================================================

@router.post(
    "/seed-python/{quiz_id}",
)
def seed_python_questions_endpoint(
    quiz_id: int,
    db: Session = Depends(get_database),
):
    try:

        return seed_python_questions(
            db,
            quiz_id,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )