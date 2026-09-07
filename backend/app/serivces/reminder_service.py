from app.models.student import Student


class ReminderService:

    @staticmethod
    def generate(student: Student):

        reminders = []

        if student.daily_study_hours is None:

            reminders.append(
                "Please set your daily study hours."
            )

        if student.study_goal is None:

            reminders.append(
                "Please update your study goal."
            )

        if student.target_exam is None:

            reminders.append(
                "Please set your target exam."
            )

        if len(reminders) == 0:

            reminders.append(
                "Everything looks good. Keep studying!"
            )

        return reminders