import json
from datetime import datetime
from urllib import request

from django.conf import settings
from django.db.models import Sum

from investments.models import Investment
from notifications.models import NotificationLog
from services.financial_health import evaluate_financial_health
from transactions.models import Transaction


def _send_email(user, notification_type, subject, html):
    log = NotificationLog.objects.create(
        user=user,
        notification_type=notification_type,
        subject=subject,
        payload={"html": html},
    )
    if not settings.RESEND_API_KEY:
        log.status = NotificationLog.Status.FAILED
        log.payload["error"] = "Missing Resend API key."
        log.save(update_fields=["status", "payload"])
        return {"message": "Resend API key missing.", "status": "failed"}

    body = json.dumps(
        {
            "from": settings.RESEND_FROM_EMAIL,
            "to": [user.email],
            "subject": subject,
            "html": html,
        }
    ).encode("utf-8")
    req = request.Request(
        "https://api.resend.com/emails",
        data=body,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
        log.status = NotificationLog.Status.SENT
        log.sent_at = datetime.utcnow()
        log.payload["response"] = payload
        log.save(update_fields=["status", "sent_at", "payload"])
        return {"message": "Email sent.", "status": "sent", "payload": payload}
    except Exception as exc:
        log.status = NotificationLog.Status.FAILED
        log.payload["error"] = str(exc)
        log.save(update_fields=["status", "payload"])
        return {"message": str(exc), "status": "failed"}


def send_monthly_expense_summary_email(user):
    total = (
        Transaction.objects.filter(
            user=user,
            transaction_type=Transaction.TransactionType.DEBIT,
        ).aggregate(total=Sum("amount"))["total"]
        or 0
    )
    html = f"<h1>Monthly Expense Summary</h1><p>Total expenses: {total}</p>"
    return _send_email(
        user,
        NotificationLog.NotificationType.MONTHLY_EXPENSE,
        "Your monthly expense summary",
        html,
    )


def send_profit_loss_report_email(user):
    investments = Investment.objects.filter(user=user)
    invested = sum((item.buy_price * item.quantity for item in investments), 0)
    current = sum((item.current_price_cache * item.quantity for item in investments), 0)
    html = (
        "<h1>Profit/Loss Report</h1>"
        f"<p>Invested value: {invested}</p>"
        f"<p>Current value: {current}</p>"
        f"<p>Profit/Loss: {current - invested}</p>"
    )
    return _send_email(
        user,
        NotificationLog.NotificationType.PROFIT_LOSS,
        "Your portfolio performance report",
        html,
    )


def send_loan_warning_email(user):
    health = evaluate_financial_health(user, 0)
    html = (
        "<h1>Loan Burden Alert</h1>"
        f"<p>Your current loan burden is {health['loan_burden']}% of income.</p>"
        f"<p>Financial health: {health['score']}</p>"
    )
    return _send_email(
        user,
        NotificationLog.NotificationType.LOAN_WARNING,
        "Loan burden warning",
        html,
    )
