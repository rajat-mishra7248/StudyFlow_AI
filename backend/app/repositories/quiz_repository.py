from sqlalchemy.orm import Session

from app.models.quiz import Quiz
from app.models.student import Student


class QuizRepository:

    # ============================================================
    # CREATE QUIZ
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        student: Student,
        data,
    ):
        quiz = Quiz(
            student_id=student.id,
            subject=data.subject,
            topic=data.topic,
            difficulty=data.difficulty,
            score=0,
            completed=False,
        )

        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        return quiz

    # ============================================================
    # GET ALL QUIZZES FOR STUDENT
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        student: Student,
    ):
        return (
            db.query(Quiz)
            .filter(
                Quiz.student_id == student.id
            )
            .order_by(
                Quiz.id.desc()
            )
            .all()
        )

    # ============================================================
    # GET ONE QUIZ FOR STUDENT
    # ============================================================

    @staticmethod
    def get_one(
        db: Session,
        student: Student,
        quiz_id: int,
    ):
        return (
            db.query(Quiz)
            .filter(
                Quiz.id == quiz_id,
                Quiz.student_id == student.id,
            )
            .first()
        )

    # ============================================================
    # GET QUIZ BY ID
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        quiz_id: int,
    ):
        return (
            db.query(Quiz)
            .filter(
                Quiz.id == quiz_id
            )
            .first()
        )

    # ============================================================
    # UPDATE QUIZ
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        quiz: Quiz,
        data,
    ):
        quiz.score = data.score
        quiz.completed = data.completed

        db.commit()
        db.refresh(quiz)

        return quiz

    # ============================================================
    # UPDATE QUIZ AFTER SUBMISSION
    # ============================================================

    @staticmethod
    def mark_completed(
        db: Session,
        quiz: Quiz,
        score: int,
        total_questions: int,
    ):
        quiz.score = score
        quiz.completed = True
        quiz.total_questions = total_questions

        db.commit()
        db.refresh(quiz)

        return quiz

    # ============================================================
    # DELETE QUIZ
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        quiz: Quiz,
    ):
        db.delete(quiz)
        db.commit()

        return True