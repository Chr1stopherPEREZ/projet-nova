FROM python:3.12-slim

WORKDIR /app

# Copie et installation des dépendances (psycopg2-binary = précompilé, pas besoin de gcc/libpq-dev)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .
COPY tests/ ./tests/

# Script de démarrage (POSIX sh)
COPY start.sh .
RUN chmod +x start.sh

# Exposition du port
EXPOSE 8000

# Commande de démarrage (migrations + seed + uvicorn)
CMD ["./start.sh"]
