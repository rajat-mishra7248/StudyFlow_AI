
import json
import re

from fastapi import HTTPException

from app.schemas.ai_timetable import (
    AITimetableRequest,
    AITimetableResponse,
)
from app.serivces.gemini_service import GeminiService


class AITimetableService:

    @staticmethod
    def generate(data: AITimetableRequest):

        subjects = ", ".join(data.subjects)
        study_days = ", ".join(data.study_days)

        prompt = f"""
You are an expert student timetable planner.

Create a weekly study timetable using ONLY the information provided below.

SUBJECTS:
{subjects}

DAILY STUDY HOURS:
{data.daily_hours}

CURRENT LEVEL:
{data.current_level}

PREFERRED TIME:
{data.preferred_time}

STUDY DAYS:
{study_days}

RULES:

1. Use only the provided subjects.
2. Use only the provided study days.
3. Do not exceed {data.daily_hours} hours per day.
4. Each study session must be between 30 and 120 minutes.
5. Do not create overlapping sessions.
6. Use 24-hour time format.
7. start_time must be HH:MM:SS.
8. end_time must be HH:MM:SS.
9. Priority must be exactly High, Medium, or Low.
10. Create a realistic balanced timetable.
11. Return ONLY valid JSON.
12. Do NOT use markdown.
13. Do NOT write explanations.

Return EXACTLY this JSON structure:

{{
    "timetable": [
        {{
            "subject": "Python",
            "day": "Monday",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "priority": "High"
        }}
    ]
}}
"""

        try:

            print("\n========================================")
            print("        AI TIMETABLE REQUEST")
            print("========================================")

            # IMPORTANT:
            # GeminiService.generate() is currently an instance method.
            # Therefore create an instance before calling it.
            gemini_service = GeminiService()

            ai_response = gemini_service.generate(prompt)

            print("AI RESPONSE:")
            print(ai_response)
            print("========================================")

            if not ai_response:
                raise ValueError("Empty AI response.")

            text = str(ai_response).strip()

            # Remove markdown code fences if AI returns them.
            text = re.sub(
                r"```json",
                "",
                text,
                flags=re.IGNORECASE,
            )

            text = re.sub(
                r"```",
                "",
                text,
            ).strip()

            # Extract JSON object if AI adds extra text.
            start = text.find("{")
            end = text.rfind("}")

            if start == -1 or end == -1:
                raise ValueError(
                    "No JSON object found in AI response."
                )

            text = text[start:end + 1]

            result = json.loads(text)

            timetable = result.get("timetable")

            if not isinstance(timetable, list):
                raise ValueError(
                    "Timetable is not a list."
                )

            cleaned_timetable = []

            for item in timetable:

                if not isinstance(item, dict):
                    continue

                subject = str(
                    item.get("subject", "")
                ).strip()

                day = str(
                    item.get("day", "")
                ).strip()

                start_time = str(
                    item.get("start_time", "")
                ).strip()

                end_time = str(
                    item.get("end_time", "")
                ).strip()

                priority = str(
                    item.get("priority", "Medium")
                ).strip()

                if not subject:
                    continue

                if not day:
                    continue

                if not start_time:
                    continue

                if not end_time:
                    continue

                if priority not in [
                    "High",
                    "Medium",
                    "Low",
                ]:
                    priority = "Medium"

                cleaned_timetable.append(
                    {
                        "subject": subject,
                        "day": day,
                        "start_time": start_time,
                        "end_time": end_time,
                        "priority": priority,
                    }
                )

            if not cleaned_timetable:
                raise ValueError(
                    "AI returned an empty timetable."
                )

            print(
                f"Generated {len(cleaned_timetable)} timetable sessions."
            )

            return AITimetableResponse(
                timetable=cleaned_timetable
            )

        except json.JSONDecodeError as exc:

            print(
                "JSON PARSING ERROR:",
                exc,
            )

            raise HTTPException(
                status_code=500,
                detail="AI returned invalid timetable JSON.",
            )

        except HTTPException:
            raise

        except Exception as exc:

            print(
                "AI TIMETABLE ERROR:",
                repr(exc),
            )

            raise HTTPException(
                status_code=500,
                detail=f"Unable to generate AI timetable: {exc}",
            )

