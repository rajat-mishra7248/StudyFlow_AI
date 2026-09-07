"""add password reset fields

Revision ID: 48f9ad0dd55e
Revises: 0f35aa398d7c
Create Date: 2026-08-24 21:01:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "48f9ad0dd55e"

down_revision: Union[str, Sequence[str], None] = "0f35aa398d7c"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add password reset fields to students table."""

    op.add_column(
        "students",
        sa.Column(
            "reset_password_token",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "students",
        sa.Column(
            "reset_password_expires",
            sa.DateTime(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_students_reset_password_token",
        "students",
        ["reset_password_token"],
        unique=False,
    )


def downgrade() -> None:
    """Remove password reset fields from students table."""

    op.drop_index(
        "ix_students_reset_password_token",
        table_name="students",
    )

    op.drop_column(
        "students",
        "reset_password_expires",
    )

    op.drop_column(
        "students",
        "reset_password_token",
    )