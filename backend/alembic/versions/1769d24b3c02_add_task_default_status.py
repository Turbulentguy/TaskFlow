
"""add task default status

Revision ID: 1769d24b3c02
Revises: c0351746eb94
Create Date: 2026-11-03 12:47:23.629086

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1769d24b3c02'
down_revision: Union[str, Sequence[str], None] = 'c0351746eb94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "Task",
        "status",
        existing_type=sa.String(length=20),
        existing_nullable=False,
        server_default=sa.text("'todo'")
    )


def downgrade() -> None:
    op.alter_column(
        "Task",
        "status",
        existing_type=sa.String(length=20),
        existing_nullable=False,
        server_default=None
    )
