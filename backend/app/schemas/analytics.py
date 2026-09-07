from pydantic import BaseModel, ConfigDict


class DashboardResponse(BaseModel):
    student_name: str
    completed_quizzes: int
    study_goal: str | None
    daily_hours: int | None
    current_level: str | None

    model_config = ConfigDict(
        from_attributes=True
    )


class ProductivityResponse(BaseModel):
    productivity: float
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )


class PerformanceResponse(BaseModel):

    total_quizzes: int

    average_score: float

    highest_score: float

    lowest_score: float

    passed_quizzes: int

    failed_quizzes: int

    model_config = ConfigDict(
        from_attributes=True
    )