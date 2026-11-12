export interface EventItem {
    id: number
    gmail_message_id: string
    status: string
    attempts: number
    result: Record<string, unknown> | null
    error: string | null
    created_at: string
    processed_at: string | null
  }
  
  export interface Ticket {
    id: number
    gmail_thread_id: string
    customer_email: string
    subject: string
    status: string
    category: string | null
    proposed_action: string | null
    created_at: string
    updated_at: string
  }
  
  export interface Message {
    id: number
    ticket_id: number
    gmail_message_id: string
    direction: "inbound" | "outbound"
    from_address: string
    body: string
    created_at: string
  }
  
  export interface KnowledgeBaseEntry {
    id: number
    section: string
    title: string
    content: string
    updated_at: string
  }