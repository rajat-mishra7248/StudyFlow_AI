from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)


class RecommendationService:

    @staticmethod
    def generate(db, student):

        results = QuizResultRepository.get_all(
            db,
            student,
        )

        if not results:
            return {
                "title": "Welcome",
                "recommendation":
                "Complete your first quiz."
            }

        average = sum(
            r.percentage for r in results
        ) / len(results)

        if average >= 85:
            return {
                "title": "Excellent",
                "recommendation":
                "Move to Advanced Level."
            }

        if average >= 65:
            return {
                "title": "Good",
                "recommendation":
                "Practice Medium Questions."
            }

        return {
            "title": "Needs Improvement",
            "recommendation":
            "Revise Fundamentals."
        }