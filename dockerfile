# Stage 1: Build the React + Vite admin dashboard
FROM node:22-slim AS dashboard-builder
WORKDIR /dashboard
COPY dashboard/package.json dashboard/package-lock.json ./
RUN npm install
COPY dashboard/ ./
RUN npm run build

# Stage 2: Python runtime with FastAPI + built dashboard
FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project

COPY app ./app
COPY --from=dashboard-builder /dashboard/dist ./dashboard/dist

ENV PATH="/app/.venv/bin:$PATH"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]