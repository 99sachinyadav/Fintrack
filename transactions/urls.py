from django.urls import path

from transactions.views import (
    MonthlyTransactionSummaryView,
    TransactionListView,
)

urlpatterns = [
    path("", TransactionListView.as_view(), name="transaction-list"),
    path("monthly-summary", MonthlyTransactionSummaryView.as_view(), name="transaction-summary"),
]
