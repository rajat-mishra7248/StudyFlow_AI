from app.models.student import Student


class PerformanceService:

    @staticmethod
    def calculate(
        student: Student,
        quiz_results,
    ):

        total_quizzes = len(
            quiz_results
        )

        if total_quizzes == 0:

            return {

                "total_quizzes": 0,

                "average_score": 0,

                "highest_score": 0,

                "lowest_score": 0,

                "passed_quizzes": 0,

                "failed_quizzes": 0,

            }

        scores = []

        for quiz in quiz_results:

            if hasattr(quiz, "percentage"):

                scores.append(
                    float(
                        quiz.percentage
                    )
                )

            else:

                scores.append(
                    float(
                        quiz.score
                    )
                )

        average_score = round(

            sum(scores) / total_quizzes,

            2,

        )

        highest_score = max(scores)

        lowest_score = min(scores)

        passed = len(

            [

                score

                for score in scores

                if score >= 40

            ]

        )

        failed = len(

            [

                score

                for score in scores

                if score < 40

            ]

        )

        return {

            "total_quizzes": total_quizzes,

            "average_score": average_score,

            "highest_score": highest_score,

            "lowest_score": lowest_score,

            "passed_quizzes": passed,

            "failed_quizzes": failed,

        }