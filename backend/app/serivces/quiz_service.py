from fastapi import HTTPException, status

from app.repositories.quiz_repository import QuizRepository
from app.repositories.question_repository import QuestionRepository
from app.repositories.quiz_result_repository import QuizResultRepository

from app.schemas.quiz_submit import QuizSubmit

from app.models.quiz_result import QuizResult
from app.models.question import Question

from app.serivces.gemini_service import GeminiService
from app.serivces.achievement_service import AchievementService

class QuizService:

    @staticmethod
    def create(db, student, data):
        quiz = QuizRepository.create(db, student, data)

        prompt = f"""
You are an expert educational quiz generator.

Generate exactly 10 multiple-choice questions.

Subject: {data.subject}
Topic: {data.topic}
Difficulty: {data.difficulty}

Return ONLY valid JSON.

Use exactly this format:

[
    {{
        "question_text": "Question text",
        "option_a": "Option A",
        "option_b": "Option B",
        "option_c": "Option C",
        "option_d": "Option D",
        "correct_answer": "A"
    }}
]

Rules:
1. Generate exactly 10 questions.
2. Every question must have exactly 4 options.
3. Only one answer must be correct.
4. correct_answer must be only A, B, C, or D.
5. Questions must be related to {data.topic}.
6. Difficulty must be {data.difficulty}.
7. Do not add markdown.
8. Do not use ```json.
9. Return only the JSON array.
"""

        try:
            ai_response = GeminiService.generate(prompt)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI question generation failed: {str(e)}",
            )

        import json

        try:
            cleaned_response = ai_response.replace("```json", "").replace("```", "").strip()
            questions_data = json.loads(cleaned_response)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini returned invalid quiz JSON.",
            )

        if not isinstance(questions_data, list):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini did not return a question list.",
            )

        if len(questions_data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini returned zero questions.",
            )

        saved_questions = []

        for question_data in questions_data[:10]:
            question_text = question_data.get("question_text")
            option_a = question_data.get("option_a")
            option_b = question_data.get("option_b")
            option_c = question_data.get("option_c")
            option_d = question_data.get("option_d")
            correct_answer = question_data.get("correct_answer")

            if not all([question_text, option_a, option_b, option_c, option_d, correct_answer]):
                continue

            correct_answer = str(correct_answer).strip().upper()

            if correct_answer not in ["A", "B", "C", "D"]:
                continue

            question = Question(
                quiz_id=quiz.id,
                question_text=question_text,
                option_a=option_a,
                option_b=option_b,
                option_c=option_c,
                option_d=option_d,
                correct_answer=correct_answer,
            )

            saved_question = QuestionRepository.create(db, question)
            saved_questions.append(saved_question)

        if not saved_questions:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Quiz was created, but questions could not be saved.",
            )

        return quiz

    @staticmethod
    def get_all(db, student):
        return QuizRepository.get_all(db, student)

    @staticmethod
    def get_one(db, student, quiz_id):
        quiz = QuizRepository.get_one(db, student, quiz_id)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found",
            )
        return quiz

    @staticmethod
    def update(db, student, quiz_id, data):
        quiz = QuizRepository.get_one(db, student, quiz_id)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found",
            )
        return QuizRepository.update(db, quiz, data)

    @staticmethod
    def delete(db, student, quiz_id):
        quiz = QuizRepository.get_one(db, student, quiz_id)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found",
            )
        QuizRepository.delete(db, quiz)
        return {"message": "Quiz deleted successfully"}

    @staticmethod
    def submit(db, student, data: QuizSubmit):
        quiz = QuizRepository.get_one(db, student, data.quiz_id)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found",
            )

        question_ids = [answer.question_id for answer in data.answers]

        if not question_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No answers were submitted.",
            )

        questions = QuestionRepository.get_by_ids(db, question_ids)

        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Questions not found",
            )

        question_map = {question.id: question for question in questions}

        correct = 0

        for answer in data.answers:
            question = question_map.get(answer.question_id)

            if question is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Question ID {answer.question_id} not found",
                )

            selected_answer = answer.selected_answer.strip().upper()
            correct_answer = question.correct_answer.strip().upper()

            if selected_answer == correct_answer:
                correct += 1

        total = len(questions)
        wrong = total - correct
        percentage = (correct / total) * 100 if total > 0 else 0

        result = QuizResult(
            student_id=student.id,
            quiz_id=data.quiz_id,
            score=correct,
            total_questions=total,
            correct_answers=correct,
            wrong_answers=wrong,
            percentage=round(percentage, 2),
        )

        QuizResultRepository.create(db, result)

        all_quiz_results = QuizResultRepository.get_all(db, student)

        AchievementService.generate(
            db=db,
            student=student,
            quizzes=all_quiz_results,
        )

        return {
            "message": "Quiz submitted successfully",
            "quiz_id": data.quiz_id,
            "score": correct,
            "total_questions": total,
            "correct_answers": correct,
            "wrong_answers": wrong,
            "percentage": round(percentage, 2),
        }