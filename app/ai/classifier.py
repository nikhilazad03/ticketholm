import sys
import asyncio
from pydantic_ai import Agent
from app.ai.schemas import Classification
from app.config import settings

# Prevent Windows IOCP ProactorEventLoop SSL socket freeze
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

INSTRUCTIONS = """
You are a classifier for incoming customer service emails for Harbor & Pine,
an online retailer of outdoor and home lifestyle goods.

Read the customer's email and output a structured classification with:
1. "section": The knowledge base section most relevant to their inquiry. Must be one of:
   - "paddle-boards": paddle board sizing, PSI, fin setup, repair, leaks, paddle care, warranty exclusions
   - "shelving": modular shelving dimensions, assembly, weight limits, replacement parts, wood care
   - "shipping": delivery windows, lost in transit, address changes, PO boxes, couriers
   - "returns-and-warranty": 30-day returns, return shipping fees, 2-year warranty, exclusions
   - "general": only if none of the above fit
2. "issues": List of specific issues mentioned by the customer.
3. "needs_human": True if customer demands refund, threatens legal action/chargeback,
   or if tone is extremely abusive or completely off-topic/non-English. Otherwise False.
"""

classifier = Agent(
    settings.classifier_model,
    output_type=Classification,
    instructions=INSTRUCTIONS,
)


def classify(thread: str) -> Classification:
    return asyncio.run(classifier.run(thread)).output