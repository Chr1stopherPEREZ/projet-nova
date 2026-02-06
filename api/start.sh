#!/bin/sh
set -eu

# Script de démarrage de l'API Nova (POSIX sh)
# 1. Attend que la DB soit prête
# 2. Applique les migrations Alembic
# 3. Exécute le seed user
# 4. Lance uvicorn

echo "==> Attente de la base de données..."

# Boucle d'attente DB (max 30 secondes)
MAX_RETRIES=30
RETRY_COUNT=0

while [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; do
    if python -c "
from sqlalchemy import create_engine, text
from app.core.config import settings
engine = create_engine(settings.database_url)
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
" 2>/dev/null; then
        echo "==> Base de données prête"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "    Tentative $RETRY_COUNT/$MAX_RETRIES..."
    sleep 1
done

if [ "$RETRY_COUNT" -eq "$MAX_RETRIES" ]; then
    echo "ERREUR: La base de données n'est pas disponible après $MAX_RETRIES secondes"
    exit 1
fi

echo "==> Application des migrations..."
alembic upgrade head

echo "==> Exécution du seed..."
python -m app.seed

echo "==> Démarrage de l'API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
