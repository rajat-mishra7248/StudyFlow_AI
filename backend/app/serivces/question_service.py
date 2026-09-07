from fastapi import HTTPException, status

from app.repositories.question_repository import (
    QuestionRepository
)


class QuestionService:

    # ============================================================
    # GET QUESTIONS BY QUIZ
    # ============================================================

    @staticmethod
    def get_by_quiz(
        db,
        quiz_id: int,
    ):
        questions = QuestionRepository.get_by_quiz(
            db,
            quiz_id,
        )

        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found for this quiz.",
            )

        return questions

    # ============================================================
    # GET ONE QUESTION
    # ============================================================

    @staticmethod
    def get_one(
        db,
        question_id: int,
    ):
        question = QuestionRepository.get_by_id(
            db,
            question_id,
        )

        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found.",
            )

        return question