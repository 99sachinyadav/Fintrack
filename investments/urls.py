from django.urls import path

from investments.views import (
    InvestmentCreateAliasView,
    InvestmentListCreateView,
    InvestmentRetrieveUpdateDestroyView,
    InvestmentSuggestionView,
    InvestmentSummaryView,
)

urlpatterns = [
    path("", InvestmentListCreateView.as_view(), name="investment-list"),
    path("add", InvestmentCreateAliasView.as_view(), name="investment-add"),
    path("summary", InvestmentSummaryView.as_view(), name="investment-summary"),
    path("suggestions", InvestmentSuggestionView.as_view(), name="investment-suggestions"),
    path("<int:pk>", InvestmentRetrieveUpdateDestroyView.as_view(), name="investment-detail"),
]
