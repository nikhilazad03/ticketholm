import type { EventItem, KnowledgeBaseEntry, Message, Ticket } from "./types"

const AUTH_KEY = "ticketholm_auth"

export function getAuthHeader(): string | null {
  return sessionStorage.getItem(AUTH_KEY)
}

export function setAuthCredentials(username: string, password: string): void {
  const token = btoa(`${username}:${password}`)
  sessionStorage.setItem(AUTH_KEY, `Basic ${token}`)
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = getAuthHeader()
  const headers = new Headers(options.headers)
  if (auth) {
    headers.set("Authorization", auth)
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const res = await fetch(path, { ...options, headers })
  if (res.status === 401) {
    clearAuth()
    throw new Error("Unauthorized")
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export const api = {
  login: () => request<{ ok: boolean }>("/api/login"),
  getEvents: () => request<EventItem[]>("/api/events"),
  getTickets: () => request<Ticket[]>("/api/tickets"),
  getTicketMessages: (ticketId: number) =>
    request<Message[]>(`/api/tickets/${ticketId}/messages`),
  getKnowledgeBase: () => request<KnowledgeBaseEntry[]>("/api/knowledge-base"),
  updateKnowledgeBaseEntry: (id: number, title: string, content: string) =>
    request<KnowledgeBaseEntry>(`/api/knowledge-base/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    }),
  pollNow: () => request<{ messages: number }>("/api/poll", { method: "POST" }),
}