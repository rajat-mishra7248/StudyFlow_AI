# backend/app/services/course_recommendation_service.py

class CourseRecommendationService:

    COURSES = {
        "Python": [
            {
                "name": "Python for Everybody",
                "platform": "Coursera",
                "level": "Beginner",
                "url": "https://www.coursera.org/specializations/python",
            },
            {
                "name": "CS50's Introduction to Programming with Python",
                "platform": "Harvard / edX",
                "level": "Beginner",
                "url": "https://cs50.harvard.edu/python/",
            },
            {
                "name": "Automate the Boring Stuff with Python",
                "platform": "Online",
                "level": "Beginner",
                "url": "https://automatetheboringstuff.com/",
            },
        ],

        "DSA": [
            {
                "name": "Striver A2Z DSA Course",
                "platform": "YouTube",
                "level": "Beginner to Advanced",
                "url": "https://www.youtube.com/@takeUforward",
            },
            {
                "name": "NeetCode",
                "platform": "YouTube",
                "level": "Intermediate",
                "url": "https://www.youtube.com/@NeetCode",
            },
        ],

        "Machine Learning": [
            {
                "name": "Machine Learning Specialization",
                "platform": "Coursera",
                "level": "Beginner",
                "url": "https://www.coursera.org/specializations/machine-learning-introduction",
            },
            {
                "name": "Google Machine Learning Crash Course",
                "platform": "Google",
                "level": "Intermediate",
                "url": "https://developers.google.com/machine-learning/crash-course",
            },
        ],

        "Deep Learning": [
            {
                "name": "Deep Learning Specialization",
                "platform": "Coursera",
                "level": "Intermediate",
                "url": "https://www.coursera.org/specializations/deep-learning",
            },
        ],

        "Data Science": [
            {
                "name": "IBM Data Science Professional Certificate",
                "platform": "Coursera",
                "level": "Beginner",
                "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
            },
        ],

        "SQL": [
            {
                "name": "SQLBolt",
                "platform": "Web",
                "level": "Beginner",
                "url": "https://sqlbolt.com/",
            },
        ],

        "AI": [
            {
                "name": "AI for Everyone",
                "platform": "Coursera",
                "level": "Beginner",
                "url": "https://www.coursera.org/learn/ai-for-everyone",
            },
        ],
    }

    @staticmethod
    def recommend(subject: str):
        subject = subject.strip()
        return CourseRecommendationService.COURSES.get(
            subject,
            [],
        )

    @staticmethod
    def get_all_courses():
        all_courses = []
        for subject, courses in CourseRecommendationService.COURSES.items():
            for course in courses:
                all_courses.append({
                    "subject": subject,
                    **course,
                })
        return all_courses

    @staticmethod
    def personalized_recommend(
        subject: str,
        average_score: float,
    ):
        courses = CourseRecommendationService.COURSES.get(
            subject.strip(),
            [],
        )

        if average_score < 60:
            level = "Beginner"
            reason = (
                "Your quiz performance is below 60%. "
                "Start with beginner-level courses and "
                "strengthen your fundamentals."
            )
        elif average_score < 75:
            level = "Intermediate"
            reason = (
                "Your performance shows that you understand "
                "the fundamentals. An intermediate course is "
                "recommended to improve your skills."
            )
        else:
            level = "Advanced"
            reason = (
                "Your quiz performance is strong. "
                "You can move toward advanced concepts "
                "and practical projects."
            )

        return {
            "subject": subject,
            "average_score": round(average_score, 2),
            "recommended_level": level,
            "reason": reason,
            "courses": courses,
        }