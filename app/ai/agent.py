import sys
import asyncio
from pydantic_ai import Agent, RunContext
from app.ai.schemas import AgentReply
from app.config import settings
from app.db import get_knowledge_section

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

INSTRUCTIONS = """
You are a customer support agent for Harbor & Pine, an outdoor and home lifestyle brand.
Your job is to draft helpful, concise, empathetic responses to customer inquiries.

Guidelines:
- Tone: Friendly, calm, and practical. No corporate jargon.
- Format: Plain text only, short paragraphs, sign off as "Harbor & Pine support".
- Never invent product details, specs, or policies. Only use facts retrieved from tools.
- If customer reports a product issue, consult the relevant product section before advising.
- When you do not know something, honestly state so.
"""

support_agent = Agent(
    settings.agent_model,
    output_type=AgentReply,
    instructions=INSTRUCTIONS,
)


@support_agent.tool
def get_section(ctx: RunContext, section_slug: str) -> str:
    """Fetch content of a knowledge base section by its slug."""
    content = get_knowledge_section(section_slug)
    if not content:
        return f"Section '{section_slug}' not found."
    return content


def write_reply(thread: str) -> AgentReply:
    return asyncio.run(support_agent.run(thread)).output