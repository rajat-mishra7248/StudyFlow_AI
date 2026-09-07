from pydantic import BaseModel, ConfigDict


class QuestionAnswer(BaseModel):
    question_id: int
    selected_answer: str


class QuizSubmit(BaseModel):
    quiz_id: int
    answers: list[QuestionAnswer]


class QuizSubmitResponse(BaseModel):
    total_questions: int
    correct_answers: int
    wrong_answers: int
    score: float
    percentage: float

    model_config = ConfigDict(
        from_attributes=True
    )