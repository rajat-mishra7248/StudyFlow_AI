from app.serivces.gemini_service import GeminiService


class AIQuizGenerator:

    @staticmethod
    def generate(subject, topic, difficulty):

        prompt = f"""
Generate 10 MCQ questions.

Subject: {subject}

Topic: {topic}

Difficulty: {difficulty}

Return in JSON format.

Each question must contain:

Question

Option A

Option B

Option C

Option D

Correct Answer

Explanation
"""

        return GeminiService.generate(prompt)