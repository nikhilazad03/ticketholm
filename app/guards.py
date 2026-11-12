from app.config import settings


def skip_reason(message: dict, headers: dict) -> str | None:
    """Return why the bot must not answer this message, or None when it may."""
    label_ids = message.get("labelIds", [])

    # 1. Skip if sent by us
    if "SENT" in label_ids:
        return "sent by us"

    # 2. Skip if from our own configured address
    from_header = headers.get("from", "").lower()
    if settings.email_address and settings.email_address.lower() in from_header:
        return "from our address"

    # 3. Skip automated system / out-of-office / bounce headers
    auto_submitted = headers.get("auto-submitted", "").lower()
    if auto_submitted and auto_submitted != "no":
        return f"auto-submitted ({auto_submitted})"

    # 4. Skip mailing lists and marketing bulk mail
    if "list-id" in headers or "list-unsubscribe" in headers:
        return "mailing list"

    precedence = headers.get("precedence", "").lower()
    if precedence in ("bulk", "list", "junk"):
        return f"precedence ({precedence})"

    return None