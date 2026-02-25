"""Ajout de variant_selector à la table watches

Revision ID: 003_add_variant_selector
Revises: 002_add_variant_fields
Create Date: 2026-02-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# identifiants de révision, utilisés par Alembic.
revision: str = '003_add_variant_selector'
down_revision: Union[str, None] = '002_add_variant_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajout de variant_selector à watches
    op.add_column('watches', sa.Column('variant_selector', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('watches', 'variant_selector')

# Add_Variant_Selector.py