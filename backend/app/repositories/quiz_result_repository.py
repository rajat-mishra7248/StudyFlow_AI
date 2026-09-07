from sqlalchemy.orm import Session

from app.models.quiz_result import QuizResult


class QuizResultRepository:

    # ---------------------------------------------------
    # Create Quiz Result
    # ---------------------------------------------------
    @staticmethod
    def create(
        db: Session,
        result: QuizResult,
    ):
        db.add(result)
        db.commit()
        db.refresh(result)

        return result

    # ---------------------------------------------------
    # Get All Results By Student ID
    # ---------------------------------------------------
    @staticmethod
    def get_all_by_student(
        db: Session,
        student_id: int,
    ):
        return (
            db.query(QuizResult)
            .filter(
                QuizResult.student_id == student_id
            )
            .all()
        )

    # ---------------------------------------------------
    # Get All Results
    #
    # Accepts:
    #   - Student object
    #   - Student ID (int)
    # ---------------------------------------------------
    @staticmethod
    def get_all(
        db: Session,
        student,
    ):
        if isinstance(student, int):
            student_id = student
        else:
            student_id = student.id

        return QuizResultRepository.get_all_by_student(
            db,
            student_id,
        )

    # ---------------------------------------------------
    # Get Single Result
    # ---------------------------------------------------
    @staticmethod
    def get_by_id(
        db: Session,
        result_id: int,
    ):
        return (
            db.query(QuizResult)
            .filter(
                QuizResult.id == result_id
            )
            .first()
        )

    # ---------------------------------------------------
    # Get Single Result For Specific Student
    # ---------------------------------------------------
    @staticmethod
    def get_by_id_and_student(
        db: Session,
        result_id: int,
        student_id: int,
    ):
        return (
            db.query(QuizResult)
            .filter(
                QuizResult.id == result_id,
                QuizResult.student_id == student_id,
            )
            .first()
        )

    # ---------------------------------------------------
    # Delete Result
    # ---------------------------------------------------
    @staticmethod
    def delete(
        db: Session,
        result: QuizResult,
    ):
        db.delete(result)
        db.commit()