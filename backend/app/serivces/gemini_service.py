import os
import time

from dotenv import load_dotenv
from google import genai
from groq import Groq

# Load backend/.env
load_dotenv()

# ============================================================
# AI MODEL CONFIGURATION
# ============================================================

GEMINI_MODEL = "gemini-3.5-flash"
GROQ_MODEL = "openai/gpt-oss-120b"

# Gemini retry configuration
GEMINI_MAX_RETRIES = 2
GEMINI_RETRY_DELAYS = [2, 4]

class GeminiService:

    # ========================================================
    # API KEYS
    # ========================================================

    @staticmethod
    def _get_gemini_api_key():

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError(
                "Gemini API key is missing. "
                "Please configure GEMINI_API_KEY in the.env file."
            )

        return api_key.strip()

    @staticmethod
    def _get_groq_api_key():

        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise RuntimeError(
                "Groq API key is missing. "
                "Please configure GROQ_API_KEY in the.env file."
            )

        return api_key.strip()

    # ========================================================
    # TEMPORARY ERROR CHECK
    # ========================================================

    @staticmethod
    def _is_temporary_error(exc):

        error_text = str(exc).lower()

        temporary_errors = (
            "503",
            "unavailable",
            "service unavailable",
            "high demand",
            "temporarily",
            "overloaded",
            "resource_exhausted",
            "429",
            "rate limit",
        )

        return any(
            error in error_text
            for error in temporary_errors
        )

    # ========================================================
    # GEMINI - PRIMARY AI
    # ========================================================

    @staticmethod
    def _generate_with_gemini(prompt: str) -> str:

        api_key = GeminiService._get_gemini_api_key()

        client = genai.Client(
            api_key=api_key
        )

        last_error = None

        for attempt in range(
            GEMINI_MAX_RETRIES + 1
        ):

            try:

                print(
                    f"[AI] Gemini attempt "
                    f"{attempt + 1}/"
                    f"{GEMINI_MAX_RETRIES + 1}"
                )

                response = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
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
                    "[AI] Gemini response successful."
                )

                return text.strip()

            except Exception as exc:

                last_error = exc

                print(
                    f"[AI] Gemini attempt "
                    f"{attempt + 1} failed: {exc}"
                )

                # Only retry temporary errors
                if not GeminiService._is_temporary_error(
                    exc
                ):
                    raise

                # Stop after final attempt
                if attempt >= GEMINI_MAX_RETRIES:
                    break

                delay = GEMINI_RETRY_DELAYS[attempt]

                print(
                    f"[AI] Gemini temporarily unavailable. "
                    f"Retrying in {delay} seconds..."
                )

                time.sleep(delay)

        raise last_error

    # ========================================================
    # GROQ - FALLBACK AI
    # ========================================================

    @staticmethod
    def _generate_with_groq(prompt: str) -> str:

        api_key = GeminiService._get_groq_api_key()

        client = Groq(
            api_key=api_key
        )

        try:

            print(
                "[AI] Gemini unavailable."
            )

            print(
                "[AI] Switching to Groq fallback..."
            )

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            if not response.choices:
                raise RuntimeError(
                    "Groq returned an empty response."
                )

            text = response.choices[0].message.content

            if not text:
                raise RuntimeError(
                    "Groq returned an empty response."
                )

            print(
                "[AI] Groq fallback response successful."
            )

            return text.strip()

        except Exception as exc:

            print("\n========================================")
            print(" GROQ FALLBACK ERROR")
            print("========================================")

            print(
                type(exc).__name__,
                ":",
                exc
            )

            print(
                "========================================\n"
            )

            raise RuntimeError(
                f"Groq fallback error: {exc}"
            ) from exc

    # ========================================================
    # MAIN AI GENERATOR
    # ========================================================

    @staticmethod
    def generate(prompt: str) -> str:

        if not prompt or not prompt.strip():
            raise ValueError(
                "Gemini prompt cannot be empty."
            )

        # ====================================================
        # 1. PRIMARY → GEMINI
        # ====================================================

        try:

            return GeminiService._generate_with_gemini(
                prompt
            )

        except Exception as gemini_error:

            print("\n========================================")
            print(" GEMINI PRIMARY FAILED")
            print("========================================")

            print(
                type(gemini_error).__name__,
                ":",
                gemini_error
            )

            print(
                "========================================\n"
            )

            # =================================================
            # 2. FALLBACK → GROQ
            # =================================================

            if GeminiService._is_temporary_error(
                gemini_error
            ):

                try:

                    return GeminiService._generate_with_groq(
                        prompt
                    )

                except Exception as groq_error:

                    print("\n========================================")
                    print(" ALL AI PROVIDERS FAILED")
                    print("========================================")

                    print(
                        "Gemini:",
                        gemini_error
                    )

                    print(
                        "Groq:",
                        groq_error
                    )

                    print(
                        "========================================\n"
                    )

                    raise RuntimeError(
                        "Both Gemini and Groq AI services "
                        "are temporarily unavailable."
                    ) from groq_error

            # =================================================
            # 3. NON-TEMPORARY GEMINI ERROR
            # =================================================

            raise RuntimeError(
                f"Gemini API error: {gemini_error}"
            ) from gemini_error