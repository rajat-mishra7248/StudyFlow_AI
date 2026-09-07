from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)
from app.security.dependencies import get_current_student
from app.serivces.course_recommendation_service import (
    CourseRecommendationService,
)

router = APIRouter(
    prefix="/courses",
    tags=["Courses"],
)


@router.get("/all")
def get_all_courses():

    courses = (
        CourseRecommendationService
        .get_all_courses()
    )

    return {
        "total_courses": len(courses),
        "courses": courses,
    }


@router.get("/recommended")
def get_recommended_courses(
    subject: str = Query(..., min_length=1),
):

    courses = (
        CourseRecommendationService
        .recommend(subject)
    )

    return {
        "subject": subject,
        "total_courses": len(courses),
        "courses": courses,
    }


@router.get("/personalized")
def get_personalized_courses(
    subject: str = Query(..., min_length=1),
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student
    ),
):

    quizzes = QuizResultRepository.get_all(
        db,
        current_student.id,
    )

    if not quizzes:

        return {
            "subject": subject,
            "average_score": 0,
            "recommended_level": "Beginner",
            "reason": (
                "No quiz attempts found yet. "
                "Start with beginner-level courses."
            ),
            "courses": (
                CourseRecommendationService
                .recommend(subject)
            ),
        }

    average_score = sum(
        quiz.percentage
        for quiz in quizzes
    ) / len(quizzes)

    return (
        CourseRecommendationService
        .personalized_recommend(
            subject,
            average_score,
        )
    )