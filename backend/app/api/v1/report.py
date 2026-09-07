from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)
from app.schemas.report import (
    WeeklyReportResponse,
    MonthlyReportResponse,
    ProgressReportResponse,
)
from app.security.dependencies import (
    get_current_student,
)
from app.serivces.report_service import (
    ReportService,
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get(
    "/weekly",
    response_model=WeeklyReportResponse,
)
def weekly_report(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):
    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    return ReportService.weekly_report(
        current_student,
        quizzes,
    )


@router.get(
    "/monthly",
    response_model=MonthlyReportResponse,
)
def monthly_report(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):
    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    return ReportService.monthly_report(
        current_student,
        quizzes,
    )


@router.get(
    "/progress",
    response_model=ProgressReportResponse,
)
def progress_report(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):
    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    return ReportService.progress_report(
        current_student,
        quizzes,
    )