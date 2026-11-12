import { useEffect, useState } from "react"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import type { Message, Ticket } from "@/lib/types"

export function TicketsPage({ onAuthError }: { onAuthError: () => void }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadTickets() {
    try {
      setError(null)
      const data = await api.getTickets()
      setTickets(data)
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        onAuthError()
        return
      }
      setError(err instanceof Error ? err.message : "Failed to load tickets")
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  async function selectTicket(ticket: Ticket) {
    setSelected(ticket)
    setLoadingThread(true)
    try {
      const thread = await api.getTicketMessages(ticket.id)
      setMessages(thread)
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        onAuthError()
        return
      }
      setError(err instanceof Error ? err.message : "Failed to load messages")
    } finally {
      setLoadingThread(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Support Tickets</CardTitle>
          <Button variant="outline" size="sm" onClick={loadTickets}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No tickets yet.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow
                    key={t.id}
                    className={`cursor-pointer ${selected?.id === t.id ? "bg-muted/60" : ""}`}
                    onClick={() => selectTicket(t)}
                  >
                    <TableCell className="text-xs">{t.customer_email}</TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {t.subject}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.category ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">
            {selected ? selected.subject : "Thread Inspector"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selected ? (
            <p className="text-sm text-muted-foreground">
              Select a ticket on the left to inspect its email thread and proposed action.
            </p>
          ) : (
            <>
              {selected.proposed_action && (
                <div className="rounded-md border bg-muted/40 p-3 text-xs">
                  <span className="font-semibold">Proposed Action: </span>
                  {selected.proposed_action}
                </div>
              )}
              {loadingThread ? (
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg border p-3 text-sm ${
                        m.direction === "outbound" ? "bg-primary/5 border-primary/20" : "bg-card"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium">
                          {m.direction === "outbound" ? "Ticketholm AI" : m.from_address}
                        </span>
                        <span>{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">{m.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}