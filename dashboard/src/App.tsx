import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { clearAuth, getAuthHeader } from "@/lib/api"
import { EventsPage } from "@/pages/events"
import { KnowledgeBasePage } from "@/pages/knowledge-base"
import { LoginPage } from "@/pages/login"
import { TicketsPage } from "@/pages/tickets"

export function App() {
  const [authed, setAuthed] = useState<boolean>(() => Boolean(getAuthHeader()))

  function handleLogout() {
    clearAuth()
    setAuthed(false)
  }

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">Ticketholm Admin</h1>
            <p className="text-xs text-muted-foreground">Customer Support Automation</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="tickets">
          <TabsList className="mb-4">
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <TicketsPage onAuthError={handleLogout} />
          </TabsContent>
          <TabsContent value="events">
            <EventsPage onAuthError={handleLogout} />
          </TabsContent>
          <TabsContent value="kb">
            <KnowledgeBasePage onAuthError={handleLogout} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App