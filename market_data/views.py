from rest_framework import generics, permissions
from rest_framework.response import Response

from investments.models import Investment, MarketPriceSnapshot
from market_data.serializers import MarketSnapshotSerializer
from services.market_data import get_current_asset_price


class MarketSnapshotListView(generics.ListAPIView):
    serializer_class = MarketSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        symbol = self.request.query_params.get("symbol")
        asset_type = self.request.query_params.get("asset_type")
        qs = MarketPriceSnapshot.objects.all()
        if symbol:
            qs = qs.filter(symbol__iexact=symbol)
        if asset_type:
            qs = qs.filter(asset_type=asset_type)
        return qs.order_by("-captured_at")[:200]


class MarketRefreshView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tracked = Investment.objects.filter(user=request.user).values("asset_type", "symbol").distinct()
        refreshed = []
        for item in tracked:
            data = get_current_asset_price(item["asset_type"], item["symbol"])
            snapshot = MarketPriceSnapshot.objects.create(
                asset_type=item["asset_type"],
                symbol=item["symbol"],
                price=data["price"],
                currency=data["currency"],
                source=data["source"],
                raw_payload=data["payload"],
            )
            refreshed.append(MarketSnapshotSerializer(snapshot).data)
        return Response({"count": len(refreshed), "results": refreshed})
