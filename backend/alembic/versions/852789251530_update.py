"""Update

Revision ID: 852789251530
Revises: 47bc62e35561
Create Date: 2026-10-19 11:50:20.107816

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '852789251530'
down_revision: Union[str, Sequence[str], None] = '47bc62e35561'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "ProjectMember",
        "role",
        existing_type=sa.String(),
        server_default=sa.text("'Member'"),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "ProjectMember",
        "role",
        existing_type=sa.String(),
        server_default=None,
        existing_nullable=False,
    )