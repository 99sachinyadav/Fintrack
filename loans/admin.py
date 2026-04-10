from django.contrib import admin

from loans.models import LoanProvider, LoanRecommendation


@admin.register(LoanProvider)
class LoanProviderAdmin(admin.ModelAdmin):
    list_display = ("name", "interest_rate", "reliability_factor", "active")
    list_filter = ("active",)


@admin.register(LoanRecommendation)
class LoanRecommendationAdmin(admin.ModelAdmin):
    list_display = ("user", "provider", "eligible_amount", "emi", "trust_score", "created_at")
