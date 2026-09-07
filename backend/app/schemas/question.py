from pydantic import BaseModel, ConfigDict


class QuestionCreate(BaseModel):

    quiz_id: int

    question_text: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_answer: str


class QuestionUpdate(BaseModel):

    question_text: str | None = None

    option_a: str | None = None
    option_b: str | None = None
    option_c: str | None = None
    option_d: str | None = None

    correct_answer: str | None = None


class QuestionResponse(BaseModel):

    id: int

    quiz_id: int

    question_text: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_answer: str

    model_config = ConfigDict(
        from_attributes=True
    )