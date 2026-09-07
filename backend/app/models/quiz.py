from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.quiz_result import QuizResult


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )

    subject: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    topic: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    difficulty: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    score: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    total_questions: Mapped[int] = mapped_column(
        Integer,
        default=10,
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    student = relationship(
        "Student",
        back_populates="quizzes",
    )
    results = relationship(
    "QuizResult",
    back_populates="quiz",
    cascade="all, delete-orphan",
    )   
    questions = relationship(
    "Question",
    back_populates="quiz",
    cascade="all, delete-orphan",
    )
    results: Mapped[list["QuizResult"]] = relationship(
    "QuizResult",
    back_populates="quiz",
    cascade="all, delete-orphan",
    )