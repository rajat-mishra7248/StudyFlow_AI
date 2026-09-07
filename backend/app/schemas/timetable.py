from datetime import time

from pydantic import BaseModel, ConfigDict


class TimetableCreate(BaseModel):
    subject: str
    day: str
    start_time: time
    end_time: time
    priority: str = "Medium"


class TimetableUpdate(BaseModel):
    subject: str
    day: str
    start_time: time
    end_time: time
    priority: str
    completed: bool


class TimetableResponse(BaseModel):
    id: int
    subject: str
    day: str
    start_time: time
    end_time: time
    priority: str
    completed: bool

    model_config = ConfigDict(from_attributes=True)