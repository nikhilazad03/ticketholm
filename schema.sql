-- Ticketholm PostgreSQL Schema
-- Run via: psql "$DATABASE_URL" -f schema.sql

-- 1. Inbound Gmail Events (Atomic Idempotency & Retry Tracking)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    gmail_message_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'processing',
    attempts INTEGER NOT NULL DEFAULT 1,
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);

-- 2. Support Tickets (Thread-Level State & Classification)
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    gmail_thread_id TEXT NOT NULL UNIQUE,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    category TEXT,
    proposed_action TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets (updated_at DESC);

-- 3. Thread Messages (Inbound Customer & Outbound AI Replies)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    gmail_message_id TEXT NOT NULL UNIQUE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    from_address TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages (ticket_id);

-- 4. Live Knowledge Base (Policy Grounding for Triage Agent)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id SERIAL PRIMARY KEY,
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_section ON knowledge_base (section);

-- Optional Starter Seed Data (Safe to run multiple times if table is empty)
INSERT INTO knowledge_base (section, title, content)
SELECT 'billing', 'Refund & Cancellation Policy',
       'Customers may request a full refund within 14 days of purchase if usage has not exceeded trial limits. Subscriptions can be canceled anytime from Account Settings without cancellation fees.'
WHERE NOT EXISTS (SELECT 1 FROM knowledge_base);

INSERT INTO knowledge_base (section, title, content)
SELECT 'account', 'Password Reset & 2FA Recovery',
       'Password resets can be triggered via the "Forgot Password" link on the login page. If a customer is locked out due to lost two-factor authentication (2FA) access, escalate the ticket to human support for identity verification.'
WHERE NOT EXISTS (SELECT 1 FROM knowledge_base WHERE section = 'account');