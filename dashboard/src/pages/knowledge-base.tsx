import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import type { KnowledgeBaseEntry } from "@/lib/types"

export function KnowledgeBasePage({ onAuthError }: { onAuthError: () => void }) {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadEntries() {
    try {
      setError(null)
      const data = await api.getKnowledgeBase()
      setEntries(data)
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        onAuthError()
        return
      }
      setError(err instanceof Error ? err.message : "Failed to load knowledge base")
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  function startEdit(entry: KnowledgeBaseEntry) {
    setEditingId(entry.id)
    setTitle(entry.title)
    setContent(entry.content)
  }

  async function handleSave(id: number) {
    setSaving(true)
    try {
      const updated = await api.updateKnowledgeBaseEntry(id, title, content)
      setEntries((prev) => prev.map((item) => (item.id === id ? updated : item)))
      setEditingId(null)
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        onAuthError()
        return
      }
      setError(err instanceof Error ? err.message : "Failed to save entry")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No knowledge base entries found.
          </CardContent>
        </Card>
      ) : (
        entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {entry.section}
                </span>
                {editingId !== entry.id && <CardTitle className="mt-1">{entry.title}</CardTitle>}
              </div>
              {editingId !== entry.id && (
                <Button variant="outline" size="sm" onClick={() => startEdit(entry)}>
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingId === entry.id ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Content</Label>
                    <Textarea
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(entry.id)} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{entry.content}</p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}