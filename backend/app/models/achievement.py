from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.student import Student


class Achievement(Base):

    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey(
            "students.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    badge_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    badge_icon: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    earned_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    student: Mapped["Student"] = relationship(
        "Student",
        back_populates="achievements",
    )