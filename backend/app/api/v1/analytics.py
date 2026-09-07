from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student

from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)

from app.schemas.analytics import (
    DashboardResponse,
    ProductivityResponse,
    PerformanceResponse,
)

from app.security.dependencies import (
    get_current_student,
)

from app.serivces.analytics_service import (
    AnalyticsService,
)

from app.serivces.productivity_service import (
    ProductivityService,
)

from app.serivces.performance_service import (
    PerformanceService,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# =====================================================
# Analytics Dashboard
# =====================================================

@router.get(
    "/dashboard",
    response_model=DashboardResponse,
)
def dashboard(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    return AnalyticsService.dashboard(
        current_student,
        quizzes,
    )


# =====================================================
# Productivity
# =====================================================

@router.get(
    "/productivity",
    response_model=ProductivityResponse,
)
def productivity(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    return ProductivityService.calculate(
        current_student,
        quizzes,
    )


# =====================================================
# Performance
# =====================================================

@router.get(
    "/performance",
    response_model=PerformanceResponse,
)
def performance(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    return PerformanceService.calculate(
        current_student,
        quizzes,
    )