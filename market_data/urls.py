from django.urls import path

from market_data.views import MarketRefreshView, MarketSnapshotListView

urlpatterns = [
    path("snapshots", MarketSnapshotListView.as_view(), name="market-snapshots"),
    path("refresh", MarketRefreshView.as_view(), name="market-refresh"),
]
