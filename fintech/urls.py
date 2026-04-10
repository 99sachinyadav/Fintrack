from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/auth/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/investments/", include("investments.urls")),
    path("api/transactions/", include("transactions.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/loans/", include("loans.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/webhooks/", include("transactions.webhook_urls")),
]
