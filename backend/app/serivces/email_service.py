import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.settings import settings

def send_password_reset_email(
    recipient_email: str,
    reset_token: str,
):

    # ========================================================
    # RESET LINK
    # ========================================================

    frontend_url = settings.frontend_url.rstrip("/")

    reset_link = (
        f"{frontend_url}/reset-password?token={reset_token}"
    )

    # ========================================================
    # EMAIL CONTENT
    # ========================================================

    subject = "StudyFlow AI - Password Reset"

    html_body = f"""
    <!DOCTYPE html>

    <html>

    <head>

        <meta charset="UTF-8">

        <title>
            StudyFlow AI Password Reset
        </title>

    </head>

    <body
        style="
            margin: 0;
            padding: 30px;
            background-color: #f5f7fb;
            font-family: Arial, sans-serif;
        "
    >

        <div
            style="
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                padding: 35px;
                border-radius: 14px;
            "
        >

            <h1
                style="
                    color: #2563eb;
                "
            >
                StudyFlow AI
            </h1>

            <h2>
                Password Reset Request
            </h2>

            <p>
                We received a request to reset
                your StudyFlow AI account password.
            </p>

            <p>
                Click the button below to create
                a new password.
            </p>

            <!-- RESET BUTTON -->

            <div
                style="
                    margin: 30px 0;
                "
            >

                <a
                    href="{reset_link}"
                    target="_blank"
                    style="
                        display: inline-block;
                        padding: 14px 24px;
                        background: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    "
                >
                    Reset Password
                </a>

            </div>

            <p>
                This link will expire in
                <strong>15 minutes</strong>.
            </p>

            <!-- DEBUG / FALLBACK LINK -->

            <p>
                If the button does not work,
                copy and open this link:
            </p>

            <p
                style="
                    word-break: break-all;
                    color: #2563eb;
                    font-size: 13px;
                "
            >
                {reset_link}
            </p>

            <p>
                If you did not request a password
                reset, you can safely ignore this email.
            </p>

            <hr
                style="
                    border: none;
                    border-top: 1px solid #eeeeee;
                    margin: 25px 0;
                "
            >

            <p
                style="
                    color: #667085;
                    font-size: 12px;
                "
            >
                This is an automated email
                from StudyFlow AI.
            </p>

        </div>

    </body>

    </html>
    """

    # ========================================================
    # EMAIL MESSAGE
    # ========================================================

    message = MIMEMultipart("alternative")

    message["Subject"] = subject

    message["From"] = (
        f"{settings.smtp_from_name} "
        f"<{settings.smtp_from_email}>"
    )

    message["To"] = recipient_email

    message.attach(
        MIMEText(
            html_body,
            "html",
        )
    )

    # ========================================================
    # SEND EMAIL
    # ========================================================

    try:

        with smtplib.SMTP(
            settings.smtp_host,
            settings.smtp_port,
        ) as server:

            server.ehlo()

            server.starttls()

            server.ehlo()

            server.login(
                settings.smtp_username,
                settings.smtp_password,
            )

            server.sendmail(
                settings.smtp_from_email,
                recipient_email,
                message.as_string(),
            )

    except Exception as exc:

        print(
            "EMAIL SENDING ERROR:",
            repr(exc),
        )

        raise