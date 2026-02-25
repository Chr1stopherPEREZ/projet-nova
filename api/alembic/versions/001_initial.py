"""Migration initiale - utilisateurs, suivis (watches), checks

Revision ID: 001_initial
Revises: 
Create Date: 2026-02-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# identifiants de révision, utilisés par Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Types Enum
    user_role = postgresql.ENUM('USER', 'ADMIN', name='user_role', create_type=False)
    user_role.create(op.get_bind(), checkfirst=True)
    
    watch_status = postgresql.ENUM('ACTIVE', 'PAUSED', name='watch_status', create_type=False)
    watch_status.create(op.get_bind(), checkfirst=True)
    
    stock_state = postgresql.ENUM('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN', 'BROKEN', name='stock_state', create_type=False)
    stock_state.create(op.get_bind(), checkfirst=True)

    # Table utilisateurs
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', user_role, nullable=False, server_default='USER'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Table site_profiles (structure minimale pour FK)
    op.create_table(
        'site_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('domain_pattern', sa.String(), nullable=False),
        sa.Column('fetch_mode', sa.String(), nullable=False, server_default='HTTP'),
        sa.Column('rules_json', postgresql.JSONB(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_site_profiles_domain', 'site_profiles', ['domain_pattern'])

    # Table suivis (watches)
    op.create_table(
        'watches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('site_profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('original_url', sa.String(), nullable=False),
        sa.Column('normalized_url', sa.String(), nullable=False),
        sa.Column('label', sa.String(), nullable=True),
        sa.Column('watch_status', watch_status, nullable=False, server_default='ACTIVE'),
        sa.Column('stock_state', stock_state, nullable=False, server_default='UNKNOWN'),
        sa.Column('last_checked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('next_check_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('fail_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['site_profile_id'], ['site_profiles.id'], ondelete='SET NULL'),
        sa.UniqueConstraint('user_id', 'normalized_url', name='uq_user_normalized_url')
    )
    op.create_index('idx_watches_due', 'watches', ['watch_status', 'next_check_at'])

    # Table checks de suivis
    op.create_table(
        'watch_checks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('watch_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('checked_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('stock_state', sa.String(), nullable=False),
        sa.Column('http_status', sa.Integer(), nullable=True),
        sa.Column('fetch_mode', sa.String(), nullable=False, server_default='HTTP'),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('error_code', sa.String(), nullable=True),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['watch_id'], ['watches.id'], ondelete='CASCADE')
    )
    op.create_index('idx_watch_checks_watch_time', 'watch_checks', ['watch_id', 'checked_at'])


def downgrade() -> None:
    op.drop_table('watch_checks')
    op.drop_table('watches')
    op.drop_table('site_profiles')
    op.drop_table('users')
    
    # Supprimer les types enum
    op.execute('DROP TYPE IF EXISTS stock_state')
    op.execute('DROP TYPE IF EXISTS watch_status')
    op.execute('DROP TYPE IF EXISTS user_role')
