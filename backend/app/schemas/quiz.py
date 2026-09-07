from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE QUIZ
# ============================================================

class QuizCreate(BaseModel):
    subject: str
    topic: str
    difficulty: str


# ============================================================
# UPDATE QUIZ
# ============================================================

class QuizUpdate(BaseModel):
    score: int
    completed: bool


# ============================================================
# QUIZ RESPONSE
# ============================================================

class QuizResponse(BaseModel):
    id: int
    subject: str
    topic: str
    difficulty: str
    score: int
    total_questions: int
    completed: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# QUESTION ANSWER
# ============================================================

class QuestionAnswer(BaseModel):
    question_id: int
    selected_answer: str | None = None


# ============================================================
# QUIZ SUBMIT
# ============================================================

class QuizSubmit(BaseModel):
    quiz_id: int
    answers: list[QuestionAnswer]


# ============================================================
# QUIZ SUBMIT RESPONSE
# ============================================================

class QuizSubmitResponse(BaseModel):
    message: str
    quiz_id: int
    score: int
    total_questions: int
    correct_answers: int
    wrong_answers: int
    percentage: float

    model_config = ConfigDict(
        from_attributes=True
    )