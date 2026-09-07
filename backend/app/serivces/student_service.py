import secrets

from datetime import datetime, timedelta

from fastapi import HTTPException, status

from sqlalchemy.orm import Session

from app.repositories.student_repository import StudentRepository

from app.schemas.student import (
    StudentCreate,
    StudentLogin,
)

from app.security.jwt_handler import create_access_token

from app.security.password import (
    verify_password,
    hash_password,
)

from app.serivces.email_service import (
    send_password_reset_email,
)


class StudentService:

    # =====================================================
    # CREATE STUDENT
    # =====================================================

    @staticmethod
    def create_student(
        db: Session,
        student: StudentCreate,
    ):

        existing_email = StudentRepository.get_by_email(
            db,
            student.email,
        )

        if existing_email:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered.",
            )

        existing_username = StudentRepository.get_by_username(
            db,
            student.username,
        )

        if existing_username:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists.",
            )

        return StudentRepository.create(
            db,
            student,
        )

    # =====================================================
    # LOGIN
    # =====================================================

    @staticmethod
    def login_student(
        db: Session,
        student: StudentLogin,
    ):

        db_student = StudentRepository.authenticate(
            db,
            student.email,
        )

        if not db_student:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not verify_password(
            student.password,
            db_student.hashed_password,
        ):

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        access_token = create_access_token(
            {
                "sub": db_student.email,
            }
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    # =====================================================
    # FORGOT PASSWORD
    # =====================================================

    @staticmethod
    def forgot_password(
        db: Session,
        email: str,
    ):

        student = StudentRepository.get_by_email(
            db,
            email,
        )

        # =================================================
        # SECURITY
        # Do not reveal whether email exists
        # =================================================

        if not student:

            return {
                "message": (
                    "If this email is registered, "
                    "a password reset link will be sent."
                )
            }

        # =================================================
        # GENERATE SECURE RESET TOKEN
        # =================================================

        token = secrets.token_urlsafe(32)

        # =================================================
        # TOKEN VALID FOR 15 MINUTES
        # =================================================

        expires_at = datetime.utcnow() + timedelta(
            minutes=15
        )

        student.reset_password_token = token

        student.reset_password_expires = expires_at

        db.commit()

        db.refresh(student)

        # =================================================
        # SEND RESET EMAIL
        # =================================================

        try:

            send_password_reset_email(
                recipient_email=student.email,
                reset_token=token,
            )

        except Exception as exc:

            print(
                "PASSWORD RESET EMAIL ERROR:",
                repr(exc),
            )

            # ---------------------------------------------
            # If email fails, invalidate token
            # ---------------------------------------------

            student.reset_password_token = None

            student.reset_password_expires = None

            db.commit()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Unable to send password reset email. "
                    "Please try again later."
                ),
            )

        # =================================================
        # SUCCESS
        # =================================================

        return {
            "message": (
                "If this email is registered, "
                "a password reset link has been sent."
            )
        }

    # =====================================================
    # RESET PASSWORD
    # =====================================================

    @staticmethod
    def reset_password(
        db: Session,
        token: str,
        new_password: str,
    ):

        student = (
            db.query(StudentRepository.model)
            .filter(
                StudentRepository.model.reset_password_token
                == token
            )
            .first()
        )

        # =================================================
        # TOKEN VALIDATION
        # =================================================

        if not student:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token.",
            )

        if not student.reset_password_expires:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token.",
            )

        # =================================================
        # CHECK TOKEN EXPIRY
        # =================================================

        if datetime.utcnow() > student.reset_password_expires:

            # Invalidate expired token

            student.reset_password_token = None

            student.reset_password_expires = None

            db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token has expired.",
            )

        # =================================================
        # PASSWORD VALIDATION
        # =================================================

        if len(new_password) < 6:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Password should contain "
                    "at least 6 characters."
                ),
            )

        # =================================================
        # HASH NEW PASSWORD
        # =================================================

        student.hashed_password = hash_password(
            new_password
        )

        # =================================================
        # INVALIDATE RESET TOKEN
        # =================================================

        student.reset_password_token = None

        student.reset_password_expires = None

        db.commit()

        return {
            "message": (
                "Password reset successfully. "
                "You can now login with your new password."
            )
        }