from app.repositories.study_plan_repository import (
    StudyPlanRepository,
)
from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)
from app.repositories.timetable_repository import (
    TimetableRepository,
)
from app.repositories.study_timer_repository import (
    StudyTimerRepository,
)


class DashboardService:

    @staticmethod
    def dashboard(
        db,
        student,
    ):
        student_id = student.id

        # Study Plans
        plans = StudyPlanRepository.get_all(
            db,
            student_id,
        )

        # Quiz Results
        quizzes = QuizResultRepository.get_all(
            db,
            student,
        )

        # Timetable
        timetable = TimetableRepository.get_all(
            db,
            student_id,
        )

        # Study Timer
        timers = StudyTimerRepository.get_all(
            db,
            student_id,
        )

        # Total score
        total_score = sum(
            quiz.score or 0
            for quiz in quizzes
        )

        # Average percentage
        average_percentage = (
            round(
                sum(
                    quiz.percentage or 0
                    for quiz in quizzes
                ) / len(quizzes),
                2,
            )
            if quizzes
            else 0
        )

        return {
            "student_name": student.full_name,
            "study_goal": student.study_goal,
            "daily_study_hours": student.daily_study_hours,

            "study_plans": len(plans),

            "quiz_attempts": len(quizzes),

            "timetable_tasks": len(timetable),

            "study_sessions": len(timers),

            "total_score": total_score,

            "average_percentage": average_percentage,
        }