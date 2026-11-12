# Ticketholm

**Autonomous Email Customer Support & Triage System**

Ticketholm is an end-to-end customer support automation platform that ingests inbound support emails from Gmail, grounds responses against a live Postgres knowledge base using structured LLM agents, dispatches replies automatically, and provides an authenticated operations dashboard for real-time ticket inspection and knowledge management.

---

## System Architecture

```mermaid
flowchart LR
    subgraph Inbound["Email Ingestion"]
        Gmail[(Gmail API)]
    end

    subgraph Worker["Background Poller Container"]
        Poller["Poller Service<br/>(python -m app.poller)"]
        Agent["Pydantic AI Triage Agent<br/>(Google Gemini)"]
    end

    subgraph Data["Persistence Layer (Supabase / Postgres)"]
        Events[("events<br/>(Idempotent Lock)")]
        KB[("knowledge_base<br/>(Live Policy Docs)")]
        Tickets[("tickets & messages<br/>(Thread State)")]
    end

    subgraph ControlPlane["Unified Web Container (:8080)"]
        FastAPI["FastAPI Backend<br/>(/api/* + HTTP Basic Auth)"]
        ReactUI["React + shadcn/ui SPA<br/>(Static Bundle)"]
    end

    Gmail -->|Fetch unread messages| Poller
    Poller -->|Atomic INSERT ON CONFLICT claim| Events
    Poller -->|Load context & thread history| KB
    Poller -->|Evaluate & draft response| Agent
    Agent -->|Structured classification & reply| Poller
    Poller -->|Persist thread & status| Tickets
    Poller -->|Send reply & apply label| Gmail

    ReactUI <-->|/api/tickets, /api/events,<br/>/api/knowledge-base, /api/poll| FastAPI
    FastAPI <--> Events
    FastAPI <--> Tickets
    FastAPI <--> KB
    FastAPI -->|Trigger manual sync| Poller
```

---

## Engineering Highlights

* **Atomic Event Claiming & Idempotency:** Inbound emails are claimed via `INSERT ... ON CONFLICT (gmail_message_id) DO UPDATE` in Postgres before processing. This prevents race conditions, duplicate replies, or dropped events across container restarts and manual dashboard polls.
* **Structured Agentic Triage:** Built with **Pydantic AI** and **Google Gemini** to enforce typed outputs—classifying ticket category, determining resolution vs. escalation status, and drafting policy-grounded responses strictly from database sections rather than unverified model priors.
* **Live Knowledge Base Management:** Support policies are stored in Postgres (`knowledge_base`) and editable directly from the admin UI. Updates take effect immediately on the next inbound email without redeploying containers or rebuilding embeddings.
* **Unified Multi-Stage Containerization:** A two-stage `Dockerfile` compiles the React + Vite + TypeScript frontend in Node 22 and mounts the static `dist/` bundle directly inside the `uv`-managed Python 3.13 FastAPI runtime, eliminating cross-origin overhead in production.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend & Worker** | Python 3.13, FastAPI, Uvicorn, Pydantic AI, `uv` |
| **LLM & Integrations** | Google Gemini API, Gmail API (OAuth2) |
| **Database** | PostgreSQL (Supabase), `psycopg` (v3 with `dict_row` & `Jsonb`) |
| **Admin Dashboard** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI |
| **Infrastructure** | Docker, Docker Compose (multi-stage build) |

---

## Project Structure

```text
ticketholm/
├── app/
│   ├── config.py          # Pydantic settings & environment configuration
│   ├── db.py              # Postgres connection pool, atomic event locks & queries
│   ├── main.py            # FastAPI routes, HTTP Basic Auth & static SPA mount
│   └── poller.py          # Gmail ingestion loop & Pydantic AI agent execution
├── dashboard/
│   ├── src/
│   │   ├── components/    # Reusable UI primitives & status badges
│   │   ├── lib/           # Typed API client, session auth & domain interfaces
│   │   └── pages/         # Login, Tickets Inspector, Events Log & Knowledge Base
│   └── vite.config.ts     # Dev proxy & production bundle config
├── schema.sql             # PostgreSQL DDL & starter knowledge base seed
├── dockerfile             # Multi-stage Node 22 + Python 3.13/uv build
├── docker-compose.yml     # Orchestrates API server & background poller services
└── pyproject.toml         # Python dependencies managed via uv
```

---

## Quick Start (Docker Compose)

### 1. Prerequisites
* Docker & Docker Compose
* PostgreSQL database (Supabase or local Postgres)
* Google Gemini API key and Gmail API OAuth credentials

### 2. Configure Environment
Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/postgres
GOOGLE_API_KEY=your_gemini_api_key
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=choose_a_strong_password
```

### 3. Initialize Database Schema
Apply `schema.sql` to create the `events`, `tickets`, `messages`, and `knowledge_base` tables (along with starter policy entries):

```bash
psql "$DATABASE_URL" -f schema.sql
```

*(If using Supabase, you can also paste the contents of `schema.sql` directly into the Supabase SQL Editor.)*

### 4. Build and Run
```bash
docker compose up -d --build
```

Verify both services are running:
```bash
docker compose ps
```

* **Admin Dashboard & API:** `http://127.0.0.1:8080`
* **Health Check:** `http://127.0.0.1:8080/health`

---

## Local Development

Run the FastAPI server and Vite dev server with hot-reload:

```bash
# Terminal 1: Start FastAPI backend
uv sync
uv run fastapi dev app/main.py

# Terminal 2: Start React dashboard (proxies /api to :8000)
cd dashboard
npm install
npm run dev
```

---

## Admin Dashboard Capabilities

* **Support Tickets:** Inspect customer threads end-to-end, view inbound messages alongside AI-generated responses, and audit ticket categories and proposed escalation actions.
* **Inbound Events:** Monitor Gmail ingestion status (`processing`, `processed`, `failed`), retry counts, raw JSON execution payloads, and trigger on-demand inbox syncs (`POST /api/poll`).
* **Knowledge Base:** View and edit support documentation by section in real time so the triage agent always references up-to-date company policies.