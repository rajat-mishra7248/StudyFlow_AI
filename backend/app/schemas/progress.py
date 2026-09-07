from pydantic import BaseModel, Field


class ProgressReport(BaseModel):

    total_quizzes: int = Field(
        default=0,
        ge=0,
    )

    completed_plans: int = Field(
        default=0,
        ge=0,
    )

    pending_plans: int = Field(
        default=0,
        ge=0,
    )

    average_quiz_score: float = Field(
        default=0.0,
        ge=0,
    )

    best_quiz_score: float = Field(
        default=0.0,
        ge=0,
    )

    lowest_quiz_score: float = Field(
        default=0.0,
        ge=0,
    )

    quiz_attempted: bool = False