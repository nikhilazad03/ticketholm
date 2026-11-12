import re
from app.ai.schemas import Classification, Decision


def extract_order_number(text: str) -> str | None:
    """Matches 3-7-7 order number format: e.g. 114-9923812-4029182"""
    match = re.search(r"\b\d{3}-\d{7}-\d{7}\b", text)
    return match.group(0) if match else None


def evaluate_rules(
    thread: str,
    classification: Classification,
    has_attachments: bool = False,
) -> Decision | None:
    # Rule 1: Email with attachments requires human review
    if has_attachments:
        return Decision(
            action="escalate",
            section=classification.section,
            reason="Email contains attachments; routing to human support.",
        )

    # Rule 2: High-risk intents (refunds, legal threats, abusive tone)
    if classification.needs_human:
        return Decision(
            action="escalate",
            section=classification.section,
            reason="Customer inquiry flagged for human escalation (refund, legal threat, or off-topic).",
        )

    # Rule 3: Shipping / tracking inquiries must escalate to human
    if classification.section == "shipping":
        return Decision(
            action="escalate",
            section=classification.section,
            reason="Shipping and delivery tracking issues require human agent handling.",
        )

    order_number = extract_order_number(thread)
    lower_thread = thread.lower()

    # Rule 4: Shelving - Damaged panels
    if "panel" in lower_thread and any(w in lower_thread for w in ["cracked", "damage", "scratched", "broken"]):
        if order_number:
            return Decision(
                action="escalate",
                section="shelving",
                proposed_action="ship-panels",
                reason=f"Order {order_number}: Damaged panel reported; propose shipping replacement panels.",
            )
        # If no order number, return None so support agent writes a reply requesting the order number

    # Rule 5: Shelving - Missing hardware
    if any(phrase in lower_thread for phrase in ["hardware", "screw", "screws", "fastener", "pack"]):
        if "missing" in lower_thread and order_number:
            return Decision(
                action="escalate",
                section="shelving",
                proposed_action="ship-hardware-kit",
                reason=f"Order {order_number}: Missing hardware reported; propose shipping hardware kit.",
            )

    return None