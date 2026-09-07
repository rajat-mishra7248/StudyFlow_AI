from app.models.achievement import Achievement
from app.repositories.achievement_repository import AchievementRepository


class AchievementService:

    # ============================================================
    # ACHIEVEMENT MILESTONES
    # ============================================================

    MILESTONES = [
        {
            "count": 1,
            "badge_name": "First Quiz",
            "badge_icon": "🥉",
            "description": "Completed your first quiz",
        },
        {
            "count": 3,
            "badge_name": "Quiz Explorer",
            "badge_icon": "⭐",
            "description": "Completed 3 quizzes",
        },
        {
            "count": 5,
            "badge_name": "Quiz Pro",
            "badge_icon": "🏆",
            "description": "Completed 5 quizzes",
        },
        {
            "count": 10,
            "badge_name": "Quiz Master",
            "badge_icon": "🥈",
            "description": "Completed 10 quizzes",
        },
        {
            "count": 25,
            "badge_name": "Study Champion",
            "badge_icon": "🥇",
            "description": "Completed 25 quizzes",
        },
    ]

    # ============================================================
    # GENERATE ACHIEVEMENTS
    # ============================================================

    @staticmethod
    def generate(
        db,
        student,
        quizzes,
    ):

        # --------------------------------------------------------
        # TOTAL COMPLETED QUIZZES
        # --------------------------------------------------------

        total_quizzes = len(quizzes)

        # --------------------------------------------------------
        # GET EXISTING ACHIEVEMENTS
        # --------------------------------------------------------

        existing = AchievementRepository.get_all(
            db,
            student,
        )

        existing_badges = {
            achievement.badge_name
            for achievement in existing
        }

        # --------------------------------------------------------
        # CHECK EVERY MILESTONE
        # --------------------------------------------------------

        for milestone in AchievementService.MILESTONES:

            required_count = milestone["count"]

            badge_name = milestone["badge_name"]

            # ----------------------------------------------------
            # USER HAS COMPLETED REQUIRED NUMBER OF QUIZZES
            # AND BADGE DOES NOT ALREADY EXIST
            # ----------------------------------------------------

            if (
                total_quizzes >= required_count
                and badge_name not in existing_badges
            ):

                achievement = Achievement(
                    student_id=student.id,
                    badge_name=badge_name,
                    badge_icon=milestone["badge_icon"],
                    description=milestone["description"],
                )

                AchievementRepository.create(
                    db,
                    achievement,
                )

                existing_badges.add(
                    badge_name
                )

        # --------------------------------------------------------
        # RETURN UPDATED ACHIEVEMENTS
        # --------------------------------------------------------

        return AchievementRepository.get_all(
            db,
            student,
        )

    # ============================================================
    # GET ACHIEVEMENTS
    # ============================================================

    @staticmethod
    def get_achievements(
        db,
        student,
        quizzes,
    ):

        return AchievementService.generate(
            db,
            student,
            quizzes,
        )