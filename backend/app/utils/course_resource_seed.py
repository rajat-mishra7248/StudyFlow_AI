from app.models.course_resource import CourseResource


def seed_course_resources(db):

    resources = [

        CourseResource(
            course_name="Python",
            instructor="Dr. Charles Severance",
            platform="Coursera",
            url="https://www.coursera.org/specializations/python",
            level="Beginner",
        ),

        CourseResource(
            course_name="Python",
            instructor="Harvard University",
            platform="YouTube",
            url="https://www.youtube.com/@cs50",
            level="Beginner",
        ),

        CourseResource(
            course_name="Python",
            instructor="Corey Schafer",
            platform="YouTube",
            url="https://www.youtube.com/@Coreyms",
            level="Intermediate",
        ),

        CourseResource(
            course_name="Machine Learning",
            instructor="Andrew Ng",
            platform="Coursera",
            url="https://www.coursera.org/learn/machine-learning",
            level="Beginner",
        ),

        CourseResource(
            course_name="Machine Learning",
            instructor="Google",
            platform="YouTube",
            url="https://www.youtube.com/@GoogleDevelopers",
            level="Beginner",
        ),

        CourseResource(
            course_name="DSA",
            instructor="Striver",
            platform="YouTube",
            url="https://www.youtube.com/@takeUforward",
            level="Beginner",
        ),

        CourseResource(
            course_name="DSA",
            instructor="NeetCode",
            platform="YouTube",
            url="https://www.youtube.com/@NeetCode",
            level="Intermediate",
        ),

        CourseResource(
            course_name="SQL",
            instructor="freeCodeCamp",
            platform="YouTube",
            url="https://www.youtube.com/@freecodecamp",
            level="Beginner",
        ),
    ]

    db.add_all(resources)
    db.commit()

    return len(resources)