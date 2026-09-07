from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    quiz_id: Mapped[int] = mapped_column(
        ForeignKey(
            "quizzes.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    option_a: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    option_b: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    option_c: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    option_d: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    correct_answer: Mapped[str] = mapped_column(
        String(1),
        nullable=False,
    )

    quiz = relationship(
        "Quiz",
        back_populates="questions",
    )