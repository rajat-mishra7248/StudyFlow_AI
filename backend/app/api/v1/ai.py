from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.security.dependencies import get_current_student

from app.schemas.ai import (
    AIResponse,
    TopicRequest,
    CareerRequest,
    QuizRequest,
    DoubtRequest,
)

from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)

from app.serivces.ai_study_service import AIStudyService
from app.serivces.ai_quiz_generator import AIQuizGenerator
from app.serivces.ai_notes_service import AINotesService
from app.serivces.career_service import CareerService
from app.serivces.doubt_solver import DoubtSolver
from app.serivces.progress_service import ProgressService


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


# ============================================================
# AI STUDY PLAN
# ============================================================

@router.get(
    "/study-plan",
    response_model=AIResponse,
)
def study_plan(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    result = AIStudyService.recommend(
        current_student,
    )

    return AIResponse(
        response=result,
    )


# ============================================================
# AI QUIZ GENERATOR
# ============================================================

@router.post(
    "/quiz",
    response_model=AIResponse,
)
def generate_quiz(
    data: QuizRequest,
):

    result = AIQuizGenerator.generate(
        subject=data.subject,
        topic=data.topic,
        difficulty=data.difficulty,
    )

    return AIResponse(
        response=result,
    )


# ============================================================
# AI NOTES GENERATOR
# ============================================================

@router.post(
    "/notes",
    response_model=AIResponse,
)
def generate_notes(
    data: TopicRequest,
):

    result = AINotesService.generate(
        topic=data.topic,
    )

    return AIResponse(
        response=result,
    )


# ============================================================
# AI CAREER ROADMAP
# ============================================================

@router.post(
    "/career",
    response_model=AIResponse,
)
def career_roadmap(
    data: CareerRequest,
):

    result = CareerService.roadmap(
        goal=data.goal,
    )

    return AIResponse(
        response=result,
    )


# ============================================================
# AI DOUBT SOLVER
# ============================================================

@router.post(
    "/doubt",
    response_model=AIResponse,
)
def solve_doubt(
    data: DoubtRequest,
):

    result = DoubtSolver.solve(
        question=data.question,
    )

    return AIResponse(
        response=result,
    )


# ============================================================
# AI PROGRESS ANALYSIS
# ============================================================

@router.get(
    "/progress",
    response_model=AIResponse,
)
def analyze_progress(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    quizzes = QuizResultRepository.get_all(
        db,
        current_student,
    )

    result = ProgressService.analyze(
        current_student,
        quizzes,
    )

    return AIResponse(
        response=result,
    )