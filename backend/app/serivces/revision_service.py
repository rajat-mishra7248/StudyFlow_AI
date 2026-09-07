class RevisionService:

    @staticmethod
    def get_revision_plan(quizzes):

        weak_topics = []

        for quiz in quizzes:

            if quiz.percentage < 60:

                weak_topics.append(
                    {
                        "topic": quiz.quiz.topic,
                        "score": quiz.percentage,
                        "priority": "High",
                    }
                )

        return {
            "revision_topics": weak_topics,
        }