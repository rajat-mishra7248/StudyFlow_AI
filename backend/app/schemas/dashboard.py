from pydantic import BaseModel


class DashboardResponse(BaseModel):

    study_plans: int

    quiz_attempts: int

    timetable_tasks: int

    study_sessions: int