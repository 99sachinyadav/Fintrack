from django.contrib import admin

from transactions.models import Transaction, WebhookEvent


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "provider", "amount", "category", "transaction_type", "occurred_at")
    list_filter = ("provider", "transaction_type", "status")
    search_fields = ("user__email", "category", "external_id")


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ("provider", "event_id", "received_at")
    search_fields = ("event_id",)
