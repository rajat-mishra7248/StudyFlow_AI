from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:

    @staticmethod
    def create(
        db: Session,
        notification: Notification,
    ):
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_all(
        db: Session,
        student,
    ):
        return (
            db.query(Notification)
            .filter(
                Notification.student_id == student.id
            )
            .order_by(Notification.created_at.desc())
            .all()
        )

    @staticmethod
    def get_one(
        db: Session,
        student,
        notification_id: int,
    ):
        return (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.student_id == student.id,
            )
            .first()
        )

    @staticmethod
    def mark_as_read(
        db: Session,
        notification,
    ):
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def delete(
        db: Session,
        notification,
    ):
        db.delete(notification)
        db.commit()