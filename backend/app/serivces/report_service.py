from datetime import datetime


class ReportService:

    @staticmethod
    def weekly_report(
        student,
        quizzes,
    ):
        total = len(quizzes)

        average = (
            sum(
                quiz.percentage
                for quiz in quizzes
            ) / total
            if total
            else 0
        )

        return {
            "student_name": student.full_name,
            "completed_quizzes": total,
            "average_score": round(
                average,
                2,
            ),
            "productivity": round(
                average,
                2,
            ),
            "study_hours": student.daily_study_hours,
            "generated_at": datetime.utcnow(),
        }

    @staticmethod
    def monthly_report(
        student,
        quizzes,
    ):
        total = len(quizzes)

        average = (
            sum(
                quiz.percentage
                for quiz in quizzes
            ) / total
            if total
            else 0
        )

        return {
            "student_name": student.full_name,
            "completed_quizzes": total,
            "average_score": round(
                average,
                2,
            ),
            "productivity": round(
                average,
                2,
            ),
            "study_hours": student.daily_study_hours,
            "generated_at": datetime.utcnow(),
        }

    @staticmethod
    def progress_report(
        student,
        quizzes,
    ):
        total = len(quizzes)

        average = (
            sum(
                quiz.percentage
                for quiz in quizzes
            ) / total
            if total
            else 0
        )

        return {
            "student_name": student.full_name,
            "current_level": student.current_level,
            "study_goal": student.study_goal,
            "target_exam": student.target_exam,
            "quizzes_completed": total,
            "average_score": round(
                average,
                2,
            ),
            "productivity": round(
                average,
                2,
            ),
        }