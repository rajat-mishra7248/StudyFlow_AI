from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
)
from app.security.dependencies import (
    get_current_student,
)
from app.serivces.notification_service import (
    NotificationService,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notification"],
)


@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):
    return NotificationService.create(
        db=db,
        student=current_student,
        data=data,
    )


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_notifications(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):
    return NotificationService.get_all(
        db=db,
        student=current_student,
    )


@router.put(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def mark_notification(
    notification_id: int,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):
    return NotificationService.mark_as_read(
        db=db,
        student=current_student,
        notification_id=notification_id,
    )


@router.delete(
    "/{notification_id}",
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):
    return NotificationService.delete(
        db=db,
        student=current_student,
        notification_id=notification_id,
    )