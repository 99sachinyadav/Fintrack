from django.urls import path

from loans.views import (
    LoanAdviceView,
    EmiCalculatorView,
    LoanApplicationView,
    LoanApplicationStatusView,
    LoanProviderDashboardView,
    LoanProviderListView,
    LoanRecommendationView,
)

urlpatterns = [
    path("emi-calculate", EmiCalculatorView.as_view(), name="loan-emi"),
    path("providers", LoanProviderListView.as_view(), name="loan-providers"),
    path("provider/dashboard", LoanProviderDashboardView.as_view(), name="loan-provider-dashboard"),
    path("applications", LoanApplicationView.as_view(), name="loan-applications"),
    path("applications/<int:pk>/status", LoanApplicationStatusView.as_view(), name="loan-application-status"),
    path("recommendations", LoanRecommendationView.as_view(), name="loan-recommendations"),
    path("advice", LoanAdviceView.as_view(), name="loan-advice"),
]
