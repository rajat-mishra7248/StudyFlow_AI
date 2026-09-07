from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student import Student
from app.schemas.student import StudentCreate
from app.security.password import hash_password

class StudentRepository:

    @staticmethod
    def get_by_email(db: Session, email: str) -> Student | None:
        statement = select(Student).where(Student.email == email)
        return db.execute(statement).scalar_one_or_none()

    @staticmethod
    def get_by_username(db: Session, username: str) -> Student | None:
        statement = select(Student).where(Student.username == username)
        return db.execute(statement).scalar_one_or_none()

    @staticmethod
    def create(db: Session, student: StudentCreate) -> Student:
        db_student = Student(
            full_name=student.full_name,
            username=student.username,
            email=student.email,
            hashed_password=hash_password(student.password),
        )

        db.add(db_student)
        db.commit()
        db.refresh(db_student)

        return db_student

    @staticmethod
    def authenticate(
        db: Session,
        email: str,
    ) -> Student | None:
        statement = select(Student).where(Student.email == email)
        return db.execute(statement).scalar_one_or_none()

    @staticmethod
    def update_profile(
        db: Session,
        student: Student,
    ) -> Student:
        db.add(student)
        db.commit()
        db.refresh(student)
        return student