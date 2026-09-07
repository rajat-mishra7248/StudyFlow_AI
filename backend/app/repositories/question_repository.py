from sqlalchemy.orm import Session

from app.models.question import Question


class QuestionRepository:

    # ============================================================
    # CREATE QUESTION
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        question: Question,
    ):
        db.add(question)
        db.commit()
        db.refresh(question)

        return question

    # ============================================================
    # GET QUESTIONS BY QUIZ
    # ============================================================

    @staticmethod
    def get_by_quiz(
        db: Session,
        quiz_id: int,
    ):
        return (
            db.query(Question)
            .filter(
                Question.quiz_id == quiz_id
            )
            .order_by(
                Question.id.asc()
            )
            .all()
        )

    # ============================================================
    # GET QUESTIONS BY IDS
    # ============================================================

    @staticmethod
    def get_by_ids(
        db: Session,
        question_ids: list[int],
    ):
        if not question_ids:
            return []

        return (
            db.query(Question)
            .filter(
                Question.id.in_(question_ids)
            )
            .all()
        )

    # ============================================================
    # GET ONE QUESTION
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        question_id: int,
    ):
        return (
            db.query(Question)
            .filter(
                Question.id == question_id
            )
            .first()
        )

    # ============================================================
    # DELETE QUESTION
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        question: Question,
    ):
        db.delete(question)
        db.commit()

        return True