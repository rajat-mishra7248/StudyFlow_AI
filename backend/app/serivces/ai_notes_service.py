from app.serivces.gemini_service import GeminiService


class AINotesService:

    @staticmethod
    def generate(topic):

        prompt = f"""
Create professional study notes.

Topic:

{topic}

Include:

Definition

Explanation

Examples

Important Points

Interview Questions

Summary
"""

        return GeminiService.generate(prompt)