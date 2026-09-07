class StreakService:

    @staticmethod
    def calculate(days):

        if days >= 100:

            badge = "Diamond"

        elif days >= 50:

            badge = "Gold"

        elif days >= 20:

            badge = "Silver"

        else:

            badge = "Bronze"

        return {

            "streak": days,

            "badge": badge,

        }