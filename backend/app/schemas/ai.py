from pydantic import BaseModel

from pydantic import BaseModel


class TopicRequest(BaseModel):
    topic: str


class CareerRequest(BaseModel):
    goal: str


class DoubtRequest(BaseModel):
    question: str


class QuizRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str


class AIResponse(BaseModel):
    response: str