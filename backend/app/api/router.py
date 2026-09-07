from fastapi import APIRouter


from app.api.v1.auth import (
    router as auth_router,
)

from app.api.v1.users import (
    router as student_router,
)

from app.api.v1.questions import (
    router as question_router,
)

from app.api.v1.resources import (
    router as resource_router,
)

from app.api.v1.quizzes import (
    router as quiz_router,
)

from app.api.v1.study_plan import (
    router as study_plan_router,
)

from app.api.v1.timetable import (
    router as timetable_router,
)

from app.api.v1.study_timer import (
    router as study_timer_router,
)

from app.api.v1.dashboard import (
    router as dashboard_router,
)

from app.api.v1.recommendation import (
    router as recommendation_router,
)

from app.api.v1.ai import (
    router as ai_router,
)

from app.api.v1.notification import (
    router as notification_router,
)

from app.api.v1.scheduler import (
    router as scheduler_router,
)

from app.api.v1.reminder import (
    router as reminder_router,
)

from app.api.v1.report import (
    router as report_router,
)

from app.api.v1.analytics import (
    router as analytics_router,
)

from app.api.v1.achievement import (
    router as achievement_router,
)

from app.api.v1.pdf import (
    router as pdf_router,
)

from app.api.v1.courses import (
    router as courses_router,
)

from app.api.v1.health import (
    router as health_router,
)

from app.api.v1.progress import (
    router as progress_router,
)


# ============================================================
# MAIN API ROUTER
# ============================================================

api_router = APIRouter()


# ============================================================
# AUTHENTICATION
# ============================================================

api_router.include_router(
    auth_router
)


# ============================================================
# STUDENT
# ============================================================

api_router.include_router(
    student_router
)


# ============================================================
# QUIZ
# ============================================================

api_router.include_router(
    question_router
)

api_router.include_router(
    quiz_router
)


# ============================================================
# STUDY
# ============================================================

api_router.include_router(
    study_plan_router
)

api_router.include_router(
    timetable_router
)

api_router.include_router(
    study_timer_router
)


# ============================================================
# PROGRESS
# ============================================================

api_router.include_router(
    progress_router
)


# ============================================================
# RESOURCES
# ============================================================

api_router.include_router(
    resource_router
)

api_router.include_router(
    courses_router
)


# ============================================================
# DASHBOARD
# ============================================================

api_router.include_router(
    dashboard_router
)


# ============================================================
# AI
# ============================================================

api_router.include_router(
    recommendation_router
)

api_router.include_router(
    ai_router
)


# ============================================================
# NOTIFICATIONS
# ============================================================

api_router.include_router(
    notification_router
)

api_router.include_router(
    scheduler_router
)

api_router.include_router(
    reminder_router
)


# ============================================================
# ANALYTICS & REPORTS
# ============================================================

api_router.include_router(
    analytics_router
)

api_router.include_router(
    report_router
)


# ============================================================
# ACHIEVEMENTS
# ============================================================

api_router.include_router(
    achievement_router
)


# ============================================================
# PDF
# ============================================================

api_router.include_router(
    pdf_router
)


# ============================================================
# HEALTH
# ============================================================

api_router.include_router(
    health_router
)