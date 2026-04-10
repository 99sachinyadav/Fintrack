from django.urls import path

from recommendations.views import MarketTimingView, RecommendationListView

urlpatterns = [
    path("", RecommendationListView.as_view(), name="recommendations"),
    path("market-timing", MarketTimingView.as_view(), name="market-timing"),
]
