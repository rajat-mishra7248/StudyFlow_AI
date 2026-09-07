from pydantic import BaseModel
from app.schemas.question import QuestionCreate


class BulkQuestionCreate(BaseModel):

    quiz_id: int

    questions: list[QuestionCreate]