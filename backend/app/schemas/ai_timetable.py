from typing import List

from pydantic import BaseModel, Field


class AITimetableRequest(BaseModel):

    subjects: List[str] = Field(
        ...,
        min_length=1,
    )

    daily_hours: float = Field(
        ...,
        gt=0,
        le=12,
    )

    current_level: str = "Beginner"

    preferred_time: str = "Morning"

    study_days: List[str] = Field(
        ...,
        min_length=1,
    )


class AITimetableItem(BaseModel):

    subject: str
    day: str
    start_time: str
    end_time: str
    priority: str


class AITimetableResponse(BaseModel):

    timetable: List[AITimetableItem]