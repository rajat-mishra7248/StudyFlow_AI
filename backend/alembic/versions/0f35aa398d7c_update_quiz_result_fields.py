"""update quiz result fields

Revision ID: 0f35aa398d7c
Revises: 90a570ae3db0
Create Date: 2026-08-08 15:26:25.706458

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0f35aa398d7c"

down_revision: Union[str, Sequence[str], None] = "90a570ae3db0"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    with op.batch_alter_table("quiz_results", schema=None) as batch_op:

        batch_op.alter_column(
            "score",
            existing_type=sa.Integer(),
            type_=sa.Float(),
            existing_nullable=False,
            existing_server_default=sa.text("'0'"),
        )

        batch_op.alter_column(
            "percentage",
            existing_type=sa.Integer(),
            type_=sa.Float(),
            existing_nullable=False,
        )


def downgrade() -> None:
    """Downgrade schema."""

    with op.batch_alter_table("quiz_results", schema=None) as batch_op:

        batch_op.alter_column(
            "percentage",
            existing_type=sa.Float(),
            type_=sa.Integer(),
            existing_nullable=False,
        )

        batch_op.alter_column(
            "score",
            existing_type=sa.Float(),
            type_=sa.Integer(),
            existing_nullable=False,
            existing_server_default=sa.text("'0'"),
        )