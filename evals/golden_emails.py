from dataclasses import dataclass
from typing import Literal


@dataclass
class GoldenEmail:
    id: str
    description: str
    thread: str
    expected_action: Literal["reply", "escalate"]
    expected_section: str
    expected_proposed_action: str | None = None
    has_attachments: bool = False


GOLDEN_EMAILS: list[GoldenEmail] = [
    GoldenEmail(
        id="paddle-board-size",
        description="Weight-based paddle board sizing inquiry",
        thread="Which paddle board should I get? I weigh 90 kg.",
        expected_action="reply",
        expected_section="paddle-boards",
    ),
    GoldenEmail(
        id="paddle-board-pressure",
        description="Inflation PSI pressure inquiry",
        thread="What PSI should I pump my paddle board up to?",
        expected_action="reply",
        expected_section="paddle-boards",
    ),
    GoldenEmail(
        id="paddle-board-leak-untested",
        description="Slow leak reported without checking the valve",
        thread="My board seems to lose air over a couple of hours. Order 112-4839201-5528341",
        expected_action="reply",
        expected_section="paddle-boards",
    ),
    GoldenEmail(
        id="shelving-assembly-time",
        description="Assembly inquiry about shelving tools",
        thread="Do I need any special tools to put together the 3-cube shelf?",
        expected_action="reply",
        expected_section="shelving",
    ),
    GoldenEmail(
        id="damaged-panel-under-limit",
        description="1 damaged panel with order number -> ship panels",
        thread="Panel HP-S3-04 in my order 114-9923812-4029182 arrived cracked.",
        expected_action="escalate",
        expected_section="shelving",
        expected_proposed_action="ship-panels",
    ),
    GoldenEmail(
        id="damaged-panel-missing-order",
        description="Damaged panel without order number -> ask for details",
        thread="One of the wooden panels in my shelf was scratched when I opened the box.",
        expected_action="reply",
        expected_section="shelving",
    ),
    GoldenEmail(
        id="missing-hardware",
        description="Missing screw kit with order number -> ship hardware kit",
        thread="Missing the hardware pack for the HP-S4 bookcase. Order 113-1029384-9982341",
        expected_action="escalate",
        expected_section="shelving",
        expected_proposed_action="ship-hardware-kit",
    ),
    GoldenEmail(
        id="return-window-query",
        description="General 30-day return window question",
        thread="What is your return policy if I don't like the color?",
        expected_action="reply",
        expected_section="returns-and-warranty",
    ),
    GoldenEmail(
        id="refund-demand",
        description="Customer demanding a refund -> must always escalate",
        thread="This is terrible quality, I want my money back and a full refund now.",
        expected_action="escalate",
        expected_section="returns-and-warranty",
    ),
    GoldenEmail(
        id="abusive-threat",
        description="Angry customer threatening legal action -> must always escalate",
        thread="Your board deflated and hurt my shoulder. My lawyer will be contacting you.",
        expected_action="escalate",
        expected_section="paddle-boards",
    ),
    GoldenEmail(
        id="shipping-tracking-query",
        description="Specific order parcel tracking inquiry -> must escalate to a person",
        thread="Where is my parcel? The tracking for order 111-2039481-2291823 hasn't updated in 4 days.",
        expected_action="escalate",
        expected_section="shipping",
    ),
    GoldenEmail(
        id="email-with-attachment",
        description="Email that has attachments -> must escalate for human review",
        thread="Here is a picture of the damage to the corner.",
        expected_action="escalate",
        expected_section="shelving",
        has_attachments=True,
    ),
]