"""Ajout de SOLD_OUT à l'enum stock_state

Revision ID: 005_add_sold_out_stock_state
Revises: 004_add_notification_read_at

"""
from typing import Sequence, Union

from alembic import op


# identifiants de révision, utilisés par Alembic.
revision: str = '005_add_sold_out_stock_state'
down_revision: Union[str, None] = '004_add_notification_read_at'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajout de SOLD_OUT à l'enum stock_state
    # Note: ALTER TYPE ... ADD VALUE ne peut pas être annulé facilement
    op.execute("ALTER TYPE stock_state ADD VALUE IF NOT EXISTS 'SOLD_OUT'")


def downgrade() -> None:
    # Pas de moyen simple de retirer une valeur d'un enum sans recréer tout le type
    pass


# Add_Sold_Out_Stock_State.py