"""Ajout de last_notifications_read_at à la table users

Revision ID: 004_add_notification_read_at
Revises: 003_add_variant_selector

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# identifiants de révision, utilisés par Alembic.
revision: str = '004_add_notification_read_at'
down_revision: Union[str, None] = '003_add_variant_selector'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajout de last_notifications_read_at à users
    op.add_column('users', sa.Column('last_notifications_read_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'last_notifications_read_at')


# Add_Notification_Read_At.py