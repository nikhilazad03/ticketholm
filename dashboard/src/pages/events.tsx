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
import type { EventItem } from "@/lib/types"

export function EventsPage({ onAuthError }: { onAuthError: () => void }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [polling, setPolling] = useState(false)
  const [pollNote, setPollNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadEvents() {
    try {
      setError(null)
      const data = await api.getEvents()
      setEvents(data)
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        onAuthError()
        return
      }
      setError(err instanceof Error ? err.message : "Failed to load events")
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  async function handlePollNow() {
    setPolling(true)
    setPollNote(null)
    try {
      const res = await api.pollNow()
      setPollNote(`Processed ${res.messages} new message(s).`)
      await loadEvents()
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        onAuthError()
        return
      }
      setError(err instanceof Error ? err.message : "Poll failed")
    } finally {
      setPolling(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Inbound Events</CardTitle>
        <div className="flex items-center gap-2">
          {pollNote && <span className="text-sm text-muted-foreground">{pollNote}</span>}
          <Button variant="outline" size="sm" onClick={loadEvents}>
            Refresh
          </Button>
          <Button size="sm" onClick={handlePollNow} disabled={polling}>
            {polling ? "Checking..." : "Check inbox now"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Gmail Message ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Result / Error</TableHead>
              <TableHead>Processed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No events recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.id}</TableCell>
                  <TableCell className="font-mono text-xs">{ev.gmail_message_id}</TableCell>
                  <TableCell>
                    <StatusBadge status={ev.status} />
                  </TableCell>
                  <TableCell>{ev.attempts}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs">
                    {ev.error ? (
                      <span className="text-destructive">{ev.error}</span>
                    ) : ev.result ? (
                      JSON.stringify(ev.result)
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {ev.processed_at ? new Date(ev.processed_at).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}