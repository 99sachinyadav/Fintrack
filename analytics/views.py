from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import generics, permissions
from rest_framework.response import Response

from investments.models import Investment, MarketPriceSnapshot
from services.financial_health import evaluate_financial_health
from transactions.models import Transaction


class DashboardAnalyticsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        investments = Investment.objects.filter(user=request.user)
        transactions = Transaction.objects.filter(user=request.user)
        growth = (
            MarketPriceSnapshot.objects.filter(
                symbol__in=investments.values_list("symbol", flat=True)
            )
            .annotate(month=TruncMonth("captured_at"))
            .values("month")
            .annotate(total=Sum("price"))
            .order_by("month")
        )
        expenses = (
            transactions.filter(transaction_type=Transaction.TransactionType.DEBIT)
            .annotate(month=TruncMonth("occurred_at"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )
        spending = (
            transactions.filter(transaction_type=Transaction.TransactionType.DEBIT)
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )
        assets = sum(
            (investment.current_price_cache * investment.quantity for investment in investments),
            Decimal("0.00"),
        )
        net_worth = assets + request.user.savings - request.user.liabilities
        health = evaluate_financial_health(request.user, assets)
        return Response(
            {
                "investment_growth": list(growth),
                "monthly_expenses": list(expenses),
                "category_spending": list(spending),
                "net_worth": net_worth,
                "financial_health": health,
            }
        )


class NetWorthView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        investments = Investment.objects.filter(user=request.user)
        assets = sum(
            (investment.current_price_cache * investment.quantity for investment in investments),
            request.user.savings,
        )
        liabilities = request.user.liabilities
        return Response(
            {
                "assets": assets,
                "liabilities": liabilities,
                "net_worth": assets - liabilities,
            }
        )


class FinancialHealthView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        investments = Investment.objects.filter(user=request.user)
        assets = sum(
            (investment.current_price_cache * investment.quantity for investment in investments),
            Decimal("0.00"),
        )
        return Response(evaluate_financial_health(request.user, assets))
