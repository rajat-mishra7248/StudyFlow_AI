from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class CourseResource(Base):
    __tablename__ = "course_resources"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    course_name: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    instructor: Mapped[str] = mapped_column(
        String(100),
    )

    platform: Mapped[str] = mapped_column(
        String(50),
    )

    url: Mapped[str] = mapped_column(
        String(500),
    )

    level: Mapped[str] = mapped_column(
        String(30),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )