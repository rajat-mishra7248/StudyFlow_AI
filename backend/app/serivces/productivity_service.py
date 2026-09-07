
from app.repositories.quiz_result_repository import QuizResultRepository

class ProductivityService:

    @staticmethod
    def calculate(student, quizzes):

        total_quizzes = len(quizzes)

        if total_quizzes == 0:
            return {
                "productivity": 0,
                "status": "Start Learning",
            }

        average = round(
            sum(
                quiz.percentage
                for quiz in quizzes
            ) / total_quizzes,
            2,
        )

        if average >= 90:
            status = "Excellent"

        elif average >= 75:
            status = "Very Good"

        elif average >= 60:
            status = "Good"

        elif average >= 40:
            status = "Average"

        else:
            status = "Needs Improvement"

        return {
            "productivity": average,
            "status": status,
        }