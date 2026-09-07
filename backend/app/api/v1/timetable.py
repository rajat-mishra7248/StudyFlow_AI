from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.schemas.timetable import (
    TimetableCreate,
    TimetableResponse,
    TimetableUpdate,
)
from app.security.dependencies import get_current_student
from app.serivces.timetable_service import TimetableService

router = APIRouter(
    prefix="/timetables",
    tags=["Timetable"],
)


@router.post(
    "",
    response_model=TimetableResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_timetable(
    timetable: TimetableCreate,
    db: Session = Depends(get_database),
    current_student: Student = Depends(get_current_student),
):
    return TimetableService.create(
        db=db,
        student=current_student,
        data=timetable,
    )


@router.get(
    "",
    response_model=list[TimetableResponse],
)
def get_all_timetables(
    db: Session = Depends(get_database),
    current_student: Student = Depends(get_current_student),
):
    return TimetableService.get_all(
        db=db,
        student=current_student,
    )


@router.get(
    "/{timetable_id}",
    response_model=TimetableResponse,
)
def get_timetable(
    timetable_id: int,
    db: Session = Depends(get_database),
    current_student: Student = Depends(get_current_student),
):
    return TimetableService.get_one(
        db=db,
        student=current_student,
        timetable_id=timetable_id,
    )


@router.put(
    "/{timetable_id}",
    response_model=TimetableResponse,
)
def update_timetable(
    timetable_id: int,
    timetable: TimetableUpdate,
    db: Session = Depends(get_database),
    current_student: Student = Depends(get_current_student),
):
    return TimetableService.update(
        db=db,
        student=current_student,
        timetable_id=timetable_id,
        data=timetable,
    )


@router.delete(
    "/{timetable_id}",
)
def delete_timetable(
    timetable_id: int,
    db: Session = Depends(get_database),
    current_student: Student = Depends(get_current_student),
):
    return TimetableService.delete(
        db=db,
        student=current_student,
        timetable_id=timetable_id,
    )