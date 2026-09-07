from app.serivces.gemini_service import GeminiService


class AIStudyService:

    @staticmethod
    def recommend(student):

        prompt = f"""
You are StudyFlow AI, an intelligent personal study mentor.

Analyze the student's information carefully and create a
realistic, personalized learning plan.

STUDENT INFORMATION
-------------------
Name: {student.full_name}
Learning Goal: {student.study_goal}
Current Level: {student.current_level}
Learning Style: {student.learning_style}
Daily Study Hours: {student.daily_study_hours}

TASK
----
Create a personalized study plan containing:

1. Weekly Study Plan
   - Divide the learning goal into a practical 7-day plan.
   - Keep the workload realistic according to daily study hours.

2. Daily Tasks
   - Provide clear tasks for each day.
   - Mention what topic should be studied and what activity should
     be performed.

3. Learning Strategy
   - Explain how the student should study according to their
     current level and learning style.

4. Recommended Resources
   - Suggest suitable learning resources such as documentation,
     courses, books, practice platforms, or videos.
   - Prefer beginner-friendly and reliable resources.

5. Progress Strategy
   - Explain how the student can measure their progress.
   - Suggest when they should revise or practice.

6. Motivation
   - Give a short and practical motivational message.

IMPORTANT RULES
---------------
- Do not create an unrealistic schedule.
- Respect the student's available daily study hours.
- Do not overload a single day.
- Keep the recommendations practical.
- Use clear headings and bullet points.
- Do not mention that you are an AI unless necessary.
- Do not invent personal information about the student.

Return a concise but useful study plan.
"""

        return GeminiService.generate(prompt)