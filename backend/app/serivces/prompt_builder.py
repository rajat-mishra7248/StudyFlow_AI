from app.prompts.study_prompt import STUDY_PLAN_PROMPT


class PromptBuilder:

    @staticmethod
    def build(student):

        return f"""
{STUDY_PLAN_PROMPT}

Student Name:
{student.full_name}

Goal:
{student.study_goal}

Current Level:
{student.current_level}

Learning Style:
{student.learning_style}

Daily Hours:
{student.daily_study_hours}
"""