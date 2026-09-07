import os
import time
import random

import google.generativeai as genai


class AIService:

    # ============================================================
    # GEMINI CONFIGURATION
    # ============================================================

    @staticmethod
    def _configure():

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured."
            )

        genai.configure(api_key=api_key)


    # ============================================================
    # CHECK WHETHER ERROR IS TEMPORARY
    # ============================================================

    @staticmethod
    def _is_retryable_error(error):

        error_text = str(error).lower()

        retryable_messages = [
            "503",
            "service unavailable",
            "unavailable",
            "high demand",
            "overloaded",
            "temporarily",
            "capacity",
            "internal server error",
            "500",
            "502",
            "504",
        ]

        return any(
            message in error_text
            for message in retryable_messages
        )


    # ============================================================
    # GENERATE CONTENT WITH RETRY
    # ============================================================

    @staticmethod
    def _generate_content_with_retry(
        model,
        prompt,
        max_retries=4,
    ):

        last_error = None

        for attempt in range(max_retries + 1):

            try:

                print(
                    f"[Gemini] Attempt "
                    f"{attempt + 1}/{max_retries + 1}"
                )

                response = model.generate_content(
                    prompt
                )

                # ------------------------------------------------
                # Make sure Gemini actually returned text
                # ------------------------------------------------

                if not response:
                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                text = getattr(
                    response,
                    "text",
                    None
                )

                if not text:
                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                print(
                    "[Gemini] Response generated successfully."
                )

                return text

            except Exception as error:

                last_error = error

                print(
                    "[Gemini] Request failed:",
                    error
                )

                # ------------------------------------------------
                # Don't retry permanent errors
                # ------------------------------------------------

                if not AIService._is_retryable_error(
                    error
                ):
                    raise RuntimeError(
                        f"Gemini API error: {error}"
                    ) from error

                # ------------------------------------------------
                # If this was the final attempt
                # ------------------------------------------------

                if attempt >= max_retries:

                    raise RuntimeError(
                        "Gemini AI is temporarily "
                        "experiencing high demand. "
                        "Please try again in a few moments."
                    ) from last_error

                

                delay = (
                    2 ** attempt
                ) + random.uniform(
                    0.5,
                    1.5
                )

                print(
                    f"[Gemini] Retrying in "
                    f"{delay:.1f} seconds..."
                )

                time.sleep(delay)

        raise RuntimeError(
            "Gemini AI request failed."
        )


    # ============================================================
    # AI RECOMMENDATION
    # ============================================================

    @staticmethod
    def generate_recommendation(
        student_name: str,
        subject: str,
        average_score: float,
        performance: str,
    ):

        AIService._configure()

        prompt = f"""
You are StudyFlow AI, an intelligent learning assistant.

Student:
{student_name}

Subject:
{subject}

Average Quiz Score:
{average_score}%

Current Performance:
{performance}

Provide a personalized learning recommendation.

Include:
1. Performance analysis
2. Weak areas
3. What the student should study next
4. Practical improvement tips
5. A short 7-day study plan

Keep the response concise, clear and student-friendly.
"""

        # --------------------------------------------------------
        # Primary Gemini model
        # --------------------------------------------------------

        model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

        # --------------------------------------------------------
        # Generate response safely
        # --------------------------------------------------------

        return AIService._generate_content_with_retry(
            model=model,
            prompt=prompt,
            max_retries=4,
        )