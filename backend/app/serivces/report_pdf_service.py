from app.repositories.quiz_result_repository import (
    QuizResultRepository,
)
from app.serivces.report_service import (
    ReportService,
)
from app.utils.pdf_generator import (
    PDFGenerator,
)


class ReportPDFService:

    @staticmethod
    def generate_weekly(
        db,
        student,
    ):

        quizzes = QuizResultRepository.get_all(
            db,
            student,
        )

        report = ReportService.weekly_report(
            student,
            quizzes,
        )

        return PDFGenerator.generate(
            report,
            "Weekly",
        )

    @staticmethod
    def generate_monthly(
        db,
        student,
    ):

        quizzes = QuizResultRepository.get_all(
            db,
            student,
        )

        report = ReportService.monthly_report(
            student,
            quizzes,
        )

        return PDFGenerator.generate(
            report,
            "Monthly",
        )

    @staticmethod
    def generate_progress(
        db,
        student,
    ):

        quizzes = QuizResultRepository.get_all(
            db,
            student,
        )

        report = ReportService.progress_report(
            student,
            quizzes,
        )

        return PDFGenerator.generate(
            report,
            "Progress",
        )