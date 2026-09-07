from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudyTimerCreate(BaseModel):
    study_duration: int
    break_duration: int = 5


class StudyTimerUpdate(BaseModel):
    completed: bool
    ended_at: datetime


class StudyTimerResponse(BaseModel):
    id: int
    study_duration: int
    break_duration: int
    completed: bool
    started_at: datetime
    ended_at: datetime | None

    model_config = ConfigDict(from_attributes=True)