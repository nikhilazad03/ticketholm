import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()

  if (["processed", "replied", "resolved", "closed"].includes(normalized)) {
    return <Badge variant="default">{status}</Badge>
  }
  if (["failed", "escalated", "needs-review"].includes(normalized)) {
    return <Badge variant="destructive">{status}</Badge>
  }
  return <Badge variant="secondary">{status}</Badge>
}