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