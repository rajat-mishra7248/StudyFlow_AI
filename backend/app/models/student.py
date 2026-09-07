from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.study_plan import StudyPlan
    from app.models.timetable import Timetable
    from app.models.study_timer import StudyTimer
    from app.models.quiz_result import QuizResult
    from app.models.achievement import Achievement


class Student(Base):

    __tablename__ = "students"

    # =====================================================
    # BASIC INFORMATION
    # =====================================================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # =====================================================
    # PROFILE
    # =====================================================

    profile_image: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    study_goal: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    target_exam: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    learning_style: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    daily_study_hours: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    current_level: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    dark_mode: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    # =====================================================
    # FORGOT PASSWORD
    # =====================================================

    reset_password_token: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    reset_password_expires: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    study_plans = relationship(
        "StudyPlan",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    timetables = relationship(
        "Timetable",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    study_timers: Mapped[list["StudyTimer"]] = relationship(
        "StudyTimer",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    quizzes = relationship(
        "Quiz",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    quiz_results: Mapped[list["QuizResult"]] = relationship(
        "QuizResult",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    notifications = relationship(
        "Notification",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    achievements = relationship(
        "Achievement",
        back_populates="student",
        cascade="all, delete-orphan",
    )