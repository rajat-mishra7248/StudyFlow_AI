from app.repositories.quiz_result_repository import QuizResultRepository


class AIPerformanceService:

    @staticmethod
    def analyze(db, student):

        results = QuizResultRepository.get_all(
            db,
            student,
        )

        if not results:
            return {
                "message": "No quiz history found."
            }

        total_score = sum(r.score for r in results)
        total_questions = sum(r.total_questions for r in results)

        percentage = (
            (total_score / total_questions) * 100
            if total_questions
            else 0
        )

        if percentage >= 80:
            level = "Excellent"
            recommendation = (
                "Start Advanced Topics"
            )

        elif percentage >= 60:
            level = "Intermediate"
            recommendation = (
                "Practice Weak Topics"
            )

        else:
            level = "Beginner"
            recommendation = (
                "Revise Fundamentals"
            )

        return {
            "average_percentage": round(
                percentage,
                2,
            ),
            "level": level,
            "recommendation": recommendation,
        }