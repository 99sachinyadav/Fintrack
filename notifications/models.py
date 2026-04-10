from django.conf import settings
from django.db import models


class NotificationLog(models.Model):
    class NotificationType(models.TextChoices):
        MONTHLY_EXPENSE = "monthly_expense", "Monthly Expense"
        PROFIT_LOSS = "profit_loss", "Profit Loss"
        LOAN_WARNING = "loan_warning", "Loan Warning"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=40, choices=NotificationType.choices)
    subject = models.CharField(max_length=200)
    payload = models.JSONField(default=dict, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
