from app.serivces.gemini_service import GeminiService


class CareerService:

    @staticmethod
    def roadmap(goal):

        prompt = f"""
Create complete roadmap.

Career:

{goal}

Include

Skills

Projects

Courses

Books

Interview Preparation

Timeline

Resources
"""

        return GeminiService.generate(prompt)