from sqlalchemy.orm import Session

from app.models.question import Question
from app.models.quiz_result import QuizResult
from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)


class QuizSubmissionService:

    @staticmethod
    def submit(
        db: Session,
        student,
        quiz_id: int,
        answers,
    ):

        # Get questions for the selected quiz
        questions = (
            db.query(Question)
            .filter(
                Question.quiz_id == quiz_id
            )
            .all()
        )

        if not questions:
            raise ValueError(
                "No questions found for this quiz."
            )

        # Convert submitted answers into dictionary
        answer_map = {
            answer.question_id: (
                answer.selected_answer
                .strip()
                .upper()
            )
            for answer in answers
        }

        total_questions = len(questions)

        correct_answers = 0

        # Check submitted answers
        for question in questions:

            submitted_answer = answer_map.get(
                question.id
            )

            if (
                submitted_answer
                == question.correct_answer
                .strip()
                .upper()
            ):
                correct_answers += 1

        wrong_answers = (
            total_questions - correct_answers
        )

        # Calculate percentage
        percentage = round(
            (
                correct_answers
                / total_questions
            ) * 100,
            2,
        )

        # Score
        score = float(correct_answers)

        # Create quiz result
        result = QuizResult(
            student_id=student.id,
            quiz_id=quiz_id,
            total_questions=total_questions,
            correct_answers=correct_answers,
            wrong_answers=wrong_answers,
            score=score,
            percentage=percentage,
        )

        # Save result
        QuizResultRepository.create(
            db,
            result,
        )

        return {
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "wrong_answers": wrong_answers,
            "score": score,
            "percentage": percentage,
        }