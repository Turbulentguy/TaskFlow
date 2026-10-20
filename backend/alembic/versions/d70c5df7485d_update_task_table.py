
"""Update Task Table

Revision ID: d70c5df7485d
Revises: 852789251530
Create Date: 2026-10-19 16:29:49.199580

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd70c5df7485d'
down_revision: Union[str, Sequence[str], None] = '852789251530'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('Task', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('Task', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('Task', sa.Column('created_by', sa.Integer(), nullable=False))
    op.add_column('Task', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    op.add_column('Task', sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False))

    op.alter_column(
        'Task',
        'assignee_id',
        existing_type=sa.INTEGER(),
        nullable=True
    )

    op.alter_column(
        'Task',
        'status',
        existing_type=sa.VARCHAR(length=11),
        type_=sa.String(length=20),
        existing_nullable=False,
        server_default='To-do'
    )

    op.alter_column(
        'Task',
        'priority',
        existing_type=sa.VARCHAR(length=6),
        type_=sa.String(length=20),
        existing_nullable=False,
        server_default='Medium'
    )

    op.create_foreign_key(
        'fk_Task_created_by_User',
        'Task',
        'User',
        ['created_by'],
        ['id']
    )


def downgrade() -> None:
    op.drop_constraint('fk_Task_created_by_User', 'Task', type_='foreignkey')

    op.alter_column(
        'Task',
        'priority',
        existing_type=sa.String(length=20),
        type_=sa.VARCHAR(length=6),
        existing_nullable=False,
        server_default=None
    )

    op.alter_column(
        'Task',
        'status',
        existing_type=sa.String(length=20),
        type_=sa.VARCHAR(length=11),
        existing_nullable=False,
        server_default=None
    )

    op.alter_column(
        'Task',
        'assignee_id',
        existing_type=sa.INTEGER(),
        nullable=False
    )

    op.drop_column('Task', 'updated_at')
    op.drop_column('Task', 'created_at')
    op.drop_column('Task', 'created_by')
    op.drop_column('Task', 'due_date')
    op.drop_column('Task', 'description')
