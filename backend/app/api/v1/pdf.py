from fastapi import (
    APIRouter,
    Depends,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.models.student import Student
from app.security.dependencies import (
    get_current_student,
)
from app.serivces.report_pdf_service import (
    ReportPDFService,
)

router = APIRouter(
    prefix="/pdf",
    tags=["PDF Reports"],
)


@router.get("/weekly")
def weekly_pdf(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    pdf = ReportPDFService.generate_weekly(
        db,
        current_student,
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=weekly_report.pdf"
        },
    )


@router.get("/monthly")
def monthly_pdf(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    pdf = ReportPDFService.generate_monthly(
        db,
        current_student,
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=monthly_report.pdf"
        },
    )


@router.get("/progress")
def progress_pdf(
    db: Session = Depends(get_database),
    current_student: Student = Depends(
        get_current_student,
    ),
):

    pdf = ReportPDFService.generate_progress(
        db,
        current_student,
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=progress_report.pdf"
        },
    )