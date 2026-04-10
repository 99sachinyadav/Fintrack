from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import generics, permissions
from rest_framework.response import Response

from transactions.models import Transaction
from transactions.serializers import TransactionSerializer


class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class MonthlyTransactionSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        monthly = list(
            Transaction.objects.filter(user=request.user)
            .annotate(month=TruncMonth("occurred_at"))
            .values("month", "transaction_type")
            .annotate(total=Sum("amount"))
            .order_by("month", "transaction_type")
        )
        monthly_trend_map = {}
        for item in monthly:
            month = item["month"]
            bucket = monthly_trend_map.setdefault(
                month,
                {
                    "month": month,
                    "income": Decimal("0.00"),
                    "expenses": Decimal("0.00"),
                    "net_profit": Decimal("0.00"),
                },
            )
            total = item["total"] or Decimal("0.00")
            if item["transaction_type"] == Transaction.TransactionType.INCOME:
                bucket["income"] += total
            else:
                bucket["expenses"] += total
            bucket["net_profit"] = bucket["income"] - bucket["expenses"]

        monthly_trend = list(monthly_trend_map.values())
        income_total = sum((item["income"] for item in monthly_trend), Decimal("0.00"))
        expense_total = sum((item["expenses"] for item in monthly_trend), Decimal("0.00"))
        category_spending = list(
            Transaction.objects.filter(
                user=request.user,
                transaction_type=Transaction.TransactionType.EXPENSE,
            )
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )
        return Response(
            {
                "monthly_breakdown": monthly,
                "monthly_trend": monthly_trend,
                "net_profit_chart": monthly_trend,
                "total_income": income_total,
                "total_expenses": expense_total,
                "net_savings": income_total - expense_total,
                "category_spending": category_spending,
            }
        )
