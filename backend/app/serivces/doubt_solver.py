from app.serivces.gemini_service import GeminiService


class DoubtSolver:

    @staticmethod
    def solve(question):

        prompt = f"""
You are an AI Teacher.

Answer this question professionally.

Question:

{question}
"""

        return GeminiService.generate(prompt)