# Multi-stage Dockerfile for JyotishVeda Full Stack Application

# --- STAGE 1: Backend (FastAPI + Swiss Ephemeris) ---
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system build dependencies for pyswisseph
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ ./api/
COPY docs/ ./docs/

EXPOSE 8001
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8001"]

# --- STAGE 2: Frontend (Vite + React) ---
FROM node:22-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]
