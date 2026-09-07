from app.models.student import Student


class SchedulerService:

    @staticmethod
    def generate_schedule(student: Student):

        schedule = []

        if student.daily_study_hours is None:
            return [
                {
                    "time": "09:00 AM",
                    "task": "Please set your daily study hours."
                }
            ]

        total_hours = student.daily_study_hours

        start_hour = 9

        for hour in range(total_hours):

            schedule.append(
                {
                    "time": f"{start_hour + hour}:00",
                    "task": f"Study Session {hour + 1}"
                }
            )

        return schedule