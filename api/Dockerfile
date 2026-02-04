FROM python:3.12-slim

WORKDIR /app

# Installation des dépendances Lot 1
RUN pip install --no-cache-dir fastapi "uvicorn[standard]"

# Copie du code source
COPY app/ ./app/

# Exposition du port
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
