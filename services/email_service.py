from datetime import datetime

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Sum

from investments.models import Investment
from notifications.models import NotificationLog
from services.financial_health import evaluate_financial_health
from transactions.models import Transaction


def _send_email(user, notification_type, subject, html, to_email=None):
    try:
        log = NotificationLog.objects.create(
            user=user,
            notification_type=notification_type,
            subject=subject,
            payload={"html": html},
        )
    except Exception as exc:
        print("Failed to create NotificationLog:", exc)
        return {"message": "Email logging failed", "status": "failed"}
    try:
        send_mail(
            subject=subject,
            message=html,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email or user.email],
            fail_silently=False,
            html_message=html,
        )
        log.status = NotificationLog.Status.SENT
        log.sent_at = datetime.utcnow()
        log.payload["transport"] = "smtp"
        log.save(update_fields=["status", "sent_at", "payload"])
        return {"message": "Email sent.", "status": "sent"}
    except Exception as exc:
        log.status = NotificationLog.Status.FAILED
        log.payload["error"] = str(exc)
        log.save(update_fields=["status", "payload"])
        return {"message": str(exc), "status": "failed"}


def send_monthly_expense_summary_email(user):
    total = (
        Transaction.objects.filter(
            user=user,
            transaction_type=Transaction.TransactionType.EXPENSE,
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


def send_payment_receipt_email(user, transaction):
    kind = "Income" if transaction.transaction_type == Transaction.TransactionType.INCOME else "Expense"
    html = (
        "<h1>Payment Receipt</h1>"
        f"<p>Type: {kind}</p>"
        f"<p>Amount: {transaction.amount} {transaction.currency}</p>"
        f"<p>Category: {transaction.category}</p>"
        f"<p>Transaction ID: {transaction.stripe_payment_id or transaction.external_id}</p>"
    )
    return _send_email(
        user,
        NotificationLog.NotificationType.MONTHLY_EXPENSE,
        "Payment receipt - Smart Finance Advisor",
        html,
    )


def send_payment_link_email(user, payer_email, amount, description, payment_link_url):
    import urllib.parse
    qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=220x220&data={urllib.parse.quote(payment_link_url)}"
    html = (
        "<h1>Payment Request</h1>"
        f"<p>Hello,</p>"
        f"<p>You have received a new payment request for <strong>{amount} USD</strong>.</p>"
        f"<p>Description: {description}</p>"
        f"<p>Please click the link below or scan the QR code to complete the payment securely via Stripe:</p>"
        f"<br/>"
        f'<p><a href="{payment_link_url}" style="padding:10px 20px;background:#00daf3;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">Pay Now</a></p>'
        f"<br/>"
        f"<p>Or scan this QR Code:</p>"
        f'<img src="{qr_url}" alt="Payment QR Code" width="220" height="220" style="border:1px solid #ccc;border-radius:12px;"/>'
        f"<p><br/>Thank you,</p>"
        f"<p>Smart Finance Advisor</p>"
    )
    return _send_email(
        user,
        NotificationLog.NotificationType.PAYMENT_REQUEST,
        f"Payment Request: {description}",
        html,
        to_email=payer_email,
    )

