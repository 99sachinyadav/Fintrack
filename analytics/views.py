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
            transactions.filter(transaction_type=Transaction.TransactionType.EXPENSE)
            .annotate(month=TruncMonth("occurred_at"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )
        spending = (
            transactions.filter(transaction_type=Transaction.TransactionType.EXPENSE)
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


class ProjectionEngineView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import datetime
        
        initial_amount = float(request.data.get("initial_amount", 10000))
        monthly_contribution = float(request.data.get("monthly_contribution", 500))
        years = int(request.data.get("years", 5))
        asset_type = request.data.get("asset_type", "blended").lower()

        # APY and Volatility approximations
        returns = {
            "crypto": {"apy": 0.18, "volatility": 0.40},
            "stock": {"apy": 0.08, "volatility": 0.15},
            "gold": {"apy": 0.04, "volatility": 0.05},
            "blended": {"apy": 0.09, "volatility": 0.12},
        }
        
        rates = returns.get(asset_type, returns["blended"])
        monthly_rate = rates["apy"] / 12
        baseline_rate = 0.02 / 12  # Standard 2% savings baseline

        months = years * 12
        current_date = datetime.date.today().replace(day=1)
        
        projected = initial_amount
        baseline = initial_amount
        
        data = []
        for i in range(months + 1):
            if i > 0:
                # Add monthly contribution at the start of the month
                projected += monthly_contribution
                baseline += monthly_contribution
                
                # Apply compounded return
                projected *= (1 + monthly_rate)
                baseline *= (1 + baseline_rate)
            
            data.append({
                "month": current_date.strftime("%b %Y"),
                "projected_value": round(projected, 2),
                "baseline_value": round(baseline, 2),
            })
            
            # native month addition
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)

        return Response({"projection": data})
