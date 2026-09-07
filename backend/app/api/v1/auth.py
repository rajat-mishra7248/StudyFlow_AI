from fastapi import APIRouter, Depends, status

from sqlalchemy.orm import Session

from app.api.deps import get_database

from app.schemas.student import (
    StudentCreate,
    StudentLogin,
    StudentResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

from app.serivces.student_service import StudentService


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# =====================================================
# SIGNUP
# =====================================================

@router.post(
    "/signup",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    student: StudentCreate,
    db: Session = Depends(get_database),
):

    return StudentService.create_student(
        db=db,
        student=student,
    )


# =====================================================
# LOGIN
# =====================================================

@router.post("/login")
def login(
    student: StudentLogin,
    db: Session = Depends(get_database),
):

    return StudentService.login_student(
        db=db,
        student=student,
    )


# =====================================================
# FORGOT PASSWORD
# =====================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_database),
):

    return StudentService.forgot_password(
        db=db,
        email=request.email,
    )


# =====================================================
# RESET PASSWORD
# =====================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_database),
):

    return StudentService.reset_password(
        db=db,
        token=request.token,
        new_password=request.new_password,
    )