from sqlalchemy.orm import Session

from app.models.course_resource import CourseResource


class ResourceService:

    RESOURCES = {
        "Python": [
            {
                "course_name": "Python for Everybody",
                "instructor": "Charles Severance",
                "platform": "Coursera",
                "url": "https://www.coursera.org/specializations/python",
                "level": "Beginner",
            },
            {
                "course_name": "CS50's Introduction to Programming with Python",
                "instructor": "David J. Malan",
                "platform": "Harvard",
                "url": "https://cs50.harvard.edu/python/",
                "level": "Beginner",
            },
            {
                "course_name": "Python Crash Course",
                "instructor": "Eric Matthes",
                "platform": "No Starch Press",
                "url": "https://nostarch.com/python-crash-course-3rd-edition",
                "level": "Beginner",
            },
            {
                "course_name": "Automate the Boring Stuff with Python",
                "instructor": "Al Sweigart",
                "platform": "Online Book",
                "url": "https://automatetheboringstuff.com/",
                "level": "Beginner",
            },
            {
                "course_name": "Python Programming",
                "instructor": "freeCodeCamp",
                "platform": "YouTube",
                "url": "https://www.youtube.com/@freecodecamp",
                "level": "Beginner",
            },
            {
                "course_name": "Python Documentation",
                "instructor": "Python Software Foundation",
                "platform": "Official Documentation",
                "url": "https://docs.python.org/3/",
                "level": "All Levels",
            },
        ],

        "SQL": [
            {
                "course_name": "SQL for Data Science",
                "instructor": "UC Davis",
                "platform": "Coursera",
                "url": "https://www.coursera.org/learn/sql-for-data-science",
                "level": "Beginner",
            },
            {
                "course_name": "SQLBolt",
                "instructor": "SQLBolt",
                "platform": "Online Practice",
                "url": "https://sqlbolt.com/",
                "level": "Beginner",
            },
            {
                "course_name": "SQL Practice",
                "instructor": "LeetCode",
                "platform": "LeetCode",
                "url": "https://leetcode.com/problemset/database/",
                "level": "Intermediate",
            },
        ],

        "DSA": [
            {
                "course_name": "Striver A2Z DSA Course",
                "instructor": "Striver",
                "platform": "Take U Forward",
                "url": "https://takeuforward.org/strivers-a2z-dsa-course/",
                "level": "Beginner",
            },
            {
                "course_name": "DSA Practice",
                "instructor": "LeetCode",
                "platform": "LeetCode",
                "url": "https://leetcode.com/",
                "level": "Intermediate",
            },
            {
                "course_name": "Data Structures and Algorithms",
                "instructor": "GeeksforGeeks",
                "platform": "GeeksforGeeks",
                "url": "https://www.geeksforgeeks.org/dsa/",
                "level": "All Levels",
            },
        ],

        "Machine Learning": [
            {
                "course_name": "Machine Learning Specialization",
                "instructor": "Andrew Ng",
                "platform": "Coursera",
                "url": "https://www.coursera.org/specializations/machine-learning-introduction",
                "level": "Beginner",
            },
            {
                "course_name": "Machine Learning Crash Course",
                "instructor": "Google",
                "platform": "Google",
                "url": "https://developers.google.com/machine-learning/crash-course",
                "level": "Beginner",
            },
            {
                "course_name": "Machine Learning Tutorials",
                "instructor": "Krish Naik",
                "platform": "YouTube",
                "url": "https://www.youtube.com/@krishnaik06",
                "level": "Intermediate",
            },
        ],
    }

    @staticmethod
    def normalize_topic(topic: str) -> str:
        """
        Normalize user input so that:
        python, PYTHON and Python
        are treated as the same topic.
        """

        if not topic:
            return ""

        topic = topic.strip().lower()

        topic_aliases = {
            "python": "Python",
            "python programming": "Python",
            "sql": "SQL",
            "dsa": "DSA",
            "data structures": "DSA",
            "data structures and algorithms": "DSA",
            "machine learning": "Machine Learning",
            "ml": "Machine Learning",
        }

        return topic_aliases.get(
            topic,
            topic.title(),
        )

    @staticmethod
    def get_resources(topic: str):

        normalized_topic = (
            ResourceService.normalize_topic(topic)
        )

        return ResourceService.RESOURCES.get(
            normalized_topic,
            [],
        )

    @staticmethod
    def get_database_resources(
        db: Session,
        topic: str,
    ):

        normalized_topic = (
            ResourceService.normalize_topic(topic)
        )

        resources = (
            db.query(CourseResource)
            .filter(
                CourseResource.course_name.is_not(None)
            )
            .all()
        )

        # Filter using the known resource dictionary
        allowed_resources = {
            item["url"]
            for item in ResourceService.RESOURCES.get(
                normalized_topic,
                [],
            )
        }

        return [
            resource
            for resource in resources
            if resource.url in allowed_resources
        ]

    @staticmethod
    def seed_resources(
        db: Session,
        topic: str,
    ):

        normalized_topic = (
            ResourceService.normalize_topic(topic)
        )

        resources = ResourceService.RESOURCES.get(
            normalized_topic,
            [],
        )

        if not resources:
            return 0

        added = 0

        for resource in resources:

            existing = (
                db.query(CourseResource)
                .filter(
                    CourseResource.course_name
                    == resource["course_name"],
                    CourseResource.url
                    == resource["url"],
                )
                .first()
            )

            if existing:
                continue

            course_resource = CourseResource(
                course_name=resource["course_name"],
                instructor=resource["instructor"],
                platform=resource["platform"],
                url=resource["url"],
                level=resource["level"],
            )

            db.add(course_resource)

            added += 1

        db.commit()

        return added