from django.urls import path

from analytics.views import DashboardAnalyticsView, FinancialHealthView, NetWorthView, ProjectionEngineView

urlpatterns = [
    path("dashboard", DashboardAnalyticsView.as_view(), name="analytics-dashboard"),
    path("networth", NetWorthView.as_view(), name="analytics-networth"),
    path("financial-health", FinancialHealthView.as_view(), name="analytics-health"),
    path("projection", ProjectionEngineView.as_view(), name="analytics-projection"),
]
