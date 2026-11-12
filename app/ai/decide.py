import sys
import asyncio
from app.ai.agent import write_reply
from app.ai.classifier import classify
from app.ai.rules import evaluate_rules
from app.ai.schemas import Decision

# Prevent Windows IOCP ProactorEventLoop SSL socket freeze
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


def decide(thread: str, has_attachments: bool = False) -> Decision:
    # 1. Classify the customer query
    classification = classify(thread)

    # 2. Check deterministic business and escalation rules
    rule_match = evaluate_rules(thread, classification, has_attachments=has_attachments)
    if rule_match:
        return rule_match

    # 3. Generate drafted reply via support agent
    agent_reply = write_reply(thread)
    return Decision(
        action="reply",
        section=classification.section,
        reply=agent_reply.reply,
        reason=agent_reply.reason,
    )