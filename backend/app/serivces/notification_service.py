from fastapi import HTTPException, status

from app.models.notification import Notification
from app.repositories.notification_repository import (
    NotificationRepository,
)


class NotificationService:

    @staticmethod
    def create(
        db,
        student,
        data,
    ):

        notification = Notification(
            student_id=student.id,
            title=data.title,
            message=data.message,
        )

        return NotificationRepository.create(
            db,
            notification,
        )

    @staticmethod
    def get_all(
        db,
        student,
    ):
        return NotificationRepository.get_all(
            db,
            student,
        )

    @staticmethod
    def mark_as_read(
        db,
        student,
        notification_id,
    ):

        notification = NotificationRepository.get_one(
            db,
            student,
            notification_id,
        )

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )

        return NotificationRepository.mark_as_read(
            db,
            notification,
        )

    @staticmethod
    def delete(
        db,
        student,
        notification_id,
    ):

        notification = NotificationRepository.get_one(
            db,
            student,
            notification_id,
        )

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )

        NotificationRepository.delete(
            db,
            notification,
        )

        return {
            "message": "Notification deleted successfully"
        }