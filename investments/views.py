from decimal import Decimal

from rest_framework import generics, permissions
from rest_framework.response import Response

from investments.models import Investment
from investments.serializers import InvestmentSerializer, InvestmentSuggestionSerializer
from services.market_data import refresh_investment_price


class InvestmentListCreateView(generics.ListCreateAPIView):
    serializer_class = InvestmentSerializer

    def get_queryset(self):
        return Investment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InvestmentCreateAliasView(generics.CreateAPIView):
    serializer_class = InvestmentSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InvestmentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InvestmentSerializer

    def get_queryset(self):
        return Investment.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        refresh_investment_price(instance)


class InvestmentSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        investments = Investment.objects.filter(user=request.user)
        for investment in investments:
            refresh_investment_price(investment)

        total_invested = sum(
            (investment.buy_price * investment.quantity for investment in investments),
            Decimal("0.00"),
        )
        total_current = sum(
            (
                investment.current_price_cache * investment.quantity
                for investment in investments
            ),
            Decimal("0.00"),
        )
        return Response(
            {
                "portfolio_value": total_current,
                "invested_value": total_invested,
                "profit_loss": total_current - total_invested,
                "total_positions": investments.count(),
            }
        )


class InvestmentSuggestionView(generics.ListAPIView):
    serializer_class = InvestmentSuggestionSerializer

    def get_queryset(self):
        investments = Investment.objects.filter(user=self.request.user)
        for investment in investments:
            refresh_investment_price(investment)
        return investments
