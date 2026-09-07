from datetime import date

from pydantic import BaseModel, ConfigDict


class StudyPlanCreate(BaseModel):
    subject: str
    daily_hours: int
    start_date: date
    end_date: date

class StudyPlanUpdate(BaseModel):
    subject: str
    daily_hours: int
    start_date: date
    end_date: date
    status: str
    progress: int


class StudyPlanResponse(BaseModel):
    id: int
    subject: str
    daily_hours: int
    start_date: date
    end_date: date
    status: str
    progress: int

    model_config = ConfigDict(from_attributes=True)