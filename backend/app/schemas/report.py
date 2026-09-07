from datetime import datetime

from pydantic import BaseModel


class WeeklyReportResponse(BaseModel):
    student_name: str
    completed_quizzes: int
    average_score: float
    productivity: float
    study_hours: int | None
    generated_at: datetime


class MonthlyReportResponse(BaseModel):
    student_name: str
    completed_quizzes: int
    average_score: float
    productivity: float
    study_hours: int | None
    generated_at: datetime


class ProgressReportResponse(BaseModel):
    student_name: str
    current_level: str | None
    study_goal: str | None
    target_exam: str | None
    quizzes_completed: int
    average_score: float
    productivity: float