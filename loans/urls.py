from django.urls import path

from loans.views import EmiCalculatorView, LoanProviderListView, LoanRecommendationView

urlpatterns = [
    path("emi-calculate", EmiCalculatorView.as_view(), name="loan-emi"),
    path("providers", LoanProviderListView.as_view(), name="loan-providers"),
    path("recommendations", LoanRecommendationView.as_view(), name="loan-recommendations"),
]
