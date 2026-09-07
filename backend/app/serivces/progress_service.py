from app.repositories.study_plan_repository import StudyPlanRepository
from app.repositories.quiz_result_repository import QuizResultRepository
from app.repositories.study_timer_repository import StudyTimerRepository
from app.serivces.gemini_service import GeminiService

class ProgressService:

    @staticmethod
    def report(db, student):
        """
        Build the complete, database-driven progress report
        for the currently authenticated student.
        """

        # ========================================================
        # STUDY PLANS
        # ========================================================

        plans = StudyPlanRepository.get_all(
            db,
            student.id,
        )

        if plans is None:
            plans = []

        completed_plans = sum(
            1
            for plan in plans
            if bool(
                getattr(
                    plan,
                    "completed",
                    False,
                )
            )
        )

        total_plans = len(plans)
        pending_plans = max(
            total_plans - completed_plans,
            0,
        )

        # ========================================================
        # QUIZ RESULTS
        # ========================================================

        quiz_results = QuizResultRepository.get_all(
            db,
            student,
        )

        if quiz_results is None:
            quiz_results = []

        completed_quizzes = len(quiz_results)
        total_quizzes = completed_quizzes

        # ========================================================
        # QUIZ PERFORMANCE
        # ========================================================

        percentages = [
            float(
                getattr(
                    result,
                    "percentage",
                    0,
                )
                or 0
            )
            for result in quiz_results
        ]

        if percentages:
            average_quiz_score = (
                sum(percentages)
                / len(percentages)
            )
            best_quiz_score = max(percentages)
        else:
            average_quiz_score = 0.0
            best_quiz_score = 0.0

        # ========================================================
        # STUDY TIMER / STUDY ACTIVITY
        # ========================================================

        study_timers = StudyTimerRepository.get_all(
            db,
            student.id,
        )

        if study_timers is None:
            study_timers = []

        completed_timers = [
            timer
            for timer in study_timers
            if bool(
                getattr(
                    timer,
                    "completed",
                    False,
                )
            )
        ]

        study_sessions = len(completed_timers)

        total_study_minutes = sum(
            float(
                getattr(
                    timer,
                    "study_duration",
                    0,
                )
                or 0
            )
            for timer in completed_timers
        )

        study_hours = total_study_minutes / 60

        # ========================================================
        # STUDY PLAN PROGRESS
        # ========================================================

        if total_plans > 0:
            plan_progress = (
                completed_plans
                / total_plans
            ) * 100
        else:
            plan_progress = 0.0

        # ========================================================
        # QUIZ PROGRESS
        # ========================================================

        if total_quizzes > 0:
            quiz_progress = 100.0
        else:
            quiz_progress = 0.0

        # ========================================================
        # OVERALL PROGRESS
        # ========================================================

        if total_plans > 0 and total_quizzes > 0:
            overall_progress = (
                plan_progress
                + quiz_progress
            ) / 2
        elif total_plans > 0:
            overall_progress = plan_progress
        elif total_quizzes > 0:
            overall_progress = quiz_progress
        else:
            overall_progress = 0.0

        overall_progress = round(
            min(
                max(
                    overall_progress,
                    0.0,
                ),
                100.0,
            ),
            2,
        )

        # ========================================================
        # PERFORMANCE LEVEL
        # ========================================================

        if overall_progress >= 80:
            performance_level = "Advanced"
        elif overall_progress >= 50:
            performance_level = "Intermediate"
        else:
            performance_level = "Beginner"

        # ========================================================
        # RECOMMENDATION
        # ========================================================

        if not quiz_results:
            recommendation = (
                "Complete your first quiz to start "
                "tracking your quiz performance."
            )
        elif average_quiz_score < 50:
            recommendation = (
                "Focus on your weak areas and revise "
                "the concepts where you lost marks."
            )
        elif average_quiz_score < 75:
            recommendation = (
                "Your performance is improving. "
                "Keep practicing quizzes regularly."
            )
        else:
            recommendation = (
                "Excellent quiz performance. "
                "Continue challenging yourself with "
                "advanced topics."
            )

        # ========================================================
        # FINAL RESPONSE
        # ========================================================

        return {
            "overall_progress": overall_progress,
            "completed_quizzes": completed_quizzes,
            "total_quizzes": total_quizzes,
            "average_quiz_score": round(
                average_quiz_score,
                2,
            ),
            "best_quiz_score": round(
                best_quiz_score,
                2,
            ),
            "completed_plans": completed_plans,
            "total_plans": total_plans,
            "pending_plans": pending_plans,
            "study_hours": round(
                study_hours,
                2,
            ),
            "study_sessions": study_sessions,
            "performance_level": performance_level,
            "recommendation": recommendation,
        }

    # ============================================================
    # AI PROGRESS ANALYSIS
    # ============================================================

    @staticmethod
    def analyze(
        student,
        quizzes,
    ):
        if quizzes is None:
            quizzes = []

        quiz_scores = [
            round(
                float(
                    getattr(
                        quiz,
                        "percentage",
                        0,
                    )
                    or 0
                ),
                2,
            )
            for quiz in quizzes
        ]

        prompt = f"""
You are an AI learning progress analyst.

Student Goal:
{student.study_goal}

Current Level:
{student.current_level}

Completed Quizzes:
{len(quizzes)}

Quiz Performance:
{quiz_scores}

Analyze the student's learning progress.

Provide:

1. Weak Areas
2. Strong Areas
3. Improvement Tips
4. Weekly Strategy
5. Motivation

Keep the response practical, concise,
and student-friendly.
"""

        return GeminiService.generate(prompt)