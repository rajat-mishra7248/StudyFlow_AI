from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.student import Student


class StudyTimer(Base):
    __tablename__ = "study_timers"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )

    study_duration: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    break_duration: Mapped[int] = mapped_column(
        Integer,
        default=5,
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    student: Mapped["Student"] = relationship(
        "Student",
        back_populates="study_timers",
    )