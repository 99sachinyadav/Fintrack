from django.urls import path

from notifications.views import (
    LoanWarningNotificationView,
    MonthlyExpenseNotificationView,
    NotificationLogListView,
    ProfitLossNotificationView,
)

urlpatterns = [
    path("", NotificationLogListView.as_view(), name="notification-list"),
    path("send-monthly-summary", MonthlyExpenseNotificationView.as_view(), name="notify-expenses"),
    path("send-profit-loss", ProfitLossNotificationView.as_view(), name="notify-profit-loss"),
    path("send-loan-warning", LoanWarningNotificationView.as_view(), name="notify-loan-warning"),
]
