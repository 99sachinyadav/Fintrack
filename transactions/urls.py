from django.urls import path

from transactions.views import (
    ManualTransactionCreateView,
    MonthlyTransactionSummaryView,
    TransactionListView,
)

urlpatterns = [
    path("", TransactionListView.as_view(), name="transaction-list"),
    path("manual", ManualTransactionCreateView.as_view(), name="transaction-manual"),
    path("monthly-summary", MonthlyTransactionSummaryView.as_view(), name="transaction-summary"),
]
