from pydantic import BaseModel


class PersonalizedCourseResponse(BaseModel):
    subject: str
    average_score: float
    recommended_level: str
    reason: str
    courses: list