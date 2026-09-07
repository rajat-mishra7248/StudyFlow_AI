from sqlalchemy.orm import Session

from app.models.question import Question
from app.models.quiz import Quiz


def seed_python_questions(
    db: Session,
    quiz_id: int,
):
    # Check whether quiz exists
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise ValueError(
            f"Quiz with id {quiz_id} does not exist."
        )

    # Prevent duplicate questions
    existing_questions = (
        db.query(Question)
        .filter(
            Question.quiz_id == quiz_id
        )
        .count()
    )

    if existing_questions > 0:
        return {
            "message": "Questions already exist for this quiz.",
            "quiz_id": quiz_id,
            "questions_added": 0,
        }

    questions = [

        Question(
            quiz_id=quiz_id,
            question_text="Who created Python?",
            option_a="Guido van Rossum",
            option_b="James Gosling",
            option_c="Dennis Ritchie",
            option_d="Bjarne Stroustrup",
            correct_answer="A",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="Which keyword is used to define a function in Python?",
            option_a="define",
            option_b="func",
            option_c="def",
            option_d="function",
            correct_answer="C",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="Which data type is used to store True or False?",
            option_a="String",
            option_b="Boolean",
            option_c="Integer",
            option_d="Float",
            correct_answer="B",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="Which symbol is used for comments in Python?",
            option_a="//",
            option_b="<!-- -->",
            option_c="#",
            option_d="/* */",
            correct_answer="C",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="Which function is used to display output in Python?",
            option_a="display()",
            option_b="print()",
            option_c="output()",
            option_d="show()",
            correct_answer="B",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="Which keyword is used to create a class in Python?",
            option_a="class",
            option_b="struct",
            option_c="object",
            option_d="define",
            correct_answer="A",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="Which collection is ordered and changeable?",
            option_a="Tuple",
            option_b="Set",
            option_c="List",
            option_d="FrozenSet",
            correct_answer="C",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="Which operator is used for exponentiation in Python?",
            option_a="^",
            option_b="**",
            option_c="//",
            option_d="%%",
            correct_answer="B",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="Which keyword is used to handle exceptions?",
            option_a="catch",
            option_b="error",
            option_c="try",
            option_d="handle",
            correct_answer="C",
        ),

        Question(
            quiz_id=quiz_id,
            question_text="What is the extension of a Python file?",
            option_a=".java",
            option_b=".py",
            option_c=".python",
            option_d=".pt",
            correct_answer="B",
        ),
    ]

    db.add_all(questions)
    db.commit()

    return {
        "message": "Python questions added successfully.",
        "quiz_id": quiz_id,
        "questions_added": len(questions),
    }