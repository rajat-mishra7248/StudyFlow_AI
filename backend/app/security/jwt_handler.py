from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.settings import settings


def create_access_token(data: dict) -> str:
    """
    Create JWT Access Token
    """

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    to_encode.update(
        {
            "exp": expire,
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )

    return encoded_jwt