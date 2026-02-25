"""Ajout de variant_sku et variant_meta aux tables watches et watch_checks

Revision ID: 002_add_variant_fields
Revises: 001_initial
Create Date: 2026-02-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# identifiants de révision, utilisés par Alembic.
revision: str = '002_add_variant_fields'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ajout de variant_sku et variant_meta à watches
    op.add_column('watches', sa.Column('variant_sku', sa.String(), nullable=True))
    op.add_column('watches', sa.Column('variant_meta', sa.JSON(), nullable=True))
    
    # Ajout de la colonne details à watch_checks pour stocker les infos de check spécifiques aux variantes
    op.add_column('watch_checks', sa.Column('details', sa.JSON(), nullable=True))
    
    # Mise à jour de la contrainte unique pour inclure variant_sku (permet plusieurs suivis par produit avec différentes variantes)
    op.drop_constraint('uq_user_normalized_url', 'watches', type_='unique')
    op.create_unique_constraint('uq_user_url_variant', 'watches', ['user_id', 'normalized_url', 'variant_sku'])


def downgrade() -> None:
    # Restaurer la contrainte unique d'origine
    op.drop_constraint('uq_user_url_variant', 'watches', type_='unique')
    op.create_unique_constraint('uq_user_normalized_url', 'watches', ['user_id', 'normalized_url'])
    
    op.drop_column('watch_checks', 'details')
    op.drop_column('watches', 'variant_meta')
    op.drop_column('watches', 'variant_sku')

# Add_Variant_Fields.py