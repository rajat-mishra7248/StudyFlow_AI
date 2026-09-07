from app.models.student import Student


class AnalyticsService:

    @staticmethod
    def dashboard(
        student: Student,
        quizzes,
    ):

        total_quizzes = len(quizzes)

        total_correct = sum(
            quiz.correct_answers
            for quiz in quizzes
        )

        total_wrong = sum(
            quiz.wrong_answers
            for quiz in quizzes
        )

        total_points = sum(
            quiz.score
            for quiz in quizzes
        )

        average_score = 0

        if total_quizzes > 0:

            average_score = round(
                total_points / total_quizzes,
                2,
            )

        return {

            "student_name": student.full_name,

            "completed_quizzes": total_quizzes,

            "study_goal": student.study_goal,

            "daily_hours": student.daily_study_hours,

            "current_level": student.current_level,

            "average_score": average_score,

            "total_correct_answers": total_correct,

            "total_wrong_answers": total_wrong,

            "total_points": total_points,

        }