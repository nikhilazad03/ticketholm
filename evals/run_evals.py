import sys
import asyncio
from pathlib import Path
from rich.console import Console
from rich.table import Table

# Prevent Windows IOCP ProactorEventLoop SSL socket freeze
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ai.decide import decide
from evals.golden_emails import GOLDEN_EMAILS, GoldenEmail

console = Console()


def run_eval(test: GoldenEmail) -> dict:
    decision = decide(test.thread, has_attachments=test.has_attachments)

    action_ok = decision.action == test.expected_action
    section_ok = decision.section == test.expected_section

    action_proposal_ok = True
    if test.expected_proposed_action:
        action_proposal_ok = decision.proposed_action == test.expected_proposed_action

    passed = action_ok and section_ok and action_proposal_ok

    return {
        "id": test.id,
        "description": test.description,
        "passed": passed,
        "expected_action": test.expected_action,
        "actual_action": decision.action,
        "expected_section": test.expected_section,
        "actual_section": decision.section,
        "expected_proposed": test.expected_proposed_action,
        "actual_proposed": decision.proposed_action,
        "reason": decision.reason,
    }


def main():
    console.print("\n[bold cyan]🧪 Running Ticketholm Golden Email Evals...[/bold cyan]\n")

    results = []
    total = len(GOLDEN_EMAILS)

    for i, test in enumerate(GOLDEN_EMAILS, start=1):
        console.print(f"[{i}/{total}] Testing: [yellow]{test.id}[/yellow] ...", highlight=False)
        res = run_eval(test)
        results.append(res)

    table = Table(title="Evaluation Results")
    table.add_column("Test ID", style="cyan")
    table.add_column("Status", justify="center")
    table.add_column("Expected Action", style="magenta")
    table.add_column("Actual Action", style="blue")
    table.add_column("Expected Sec", style="magenta")
    table.add_column("Actual Sec", style="blue")

    passed_count = 0
    for r in results:
        status = "[bold green]PASS[/bold green]" if r["passed"] else "[bold red]FAIL[/bold red]"
        if r["passed"]:
            passed_count += 1
        table.add_row(
            r["id"],
            status,
            r["expected_action"],
            r["actual_action"],
            r["expected_section"],
            r["actual_section"],
        )

    console.print("\n", table)
    percentage = (passed_count / total) * 100

    color = "green" if percentage >= 80 else "red"
    console.print(f"\n[bold {color}]Score: {passed_count}/{total} ({percentage:.1f}% passed)[/bold {color}]\n")


if __name__ == "__main__":
    main()