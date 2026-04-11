from rest_framework import serializers

from loans.models import LoanApplication, LoanProvider, LoanRecommendation


class LoanProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanProvider
        fields = "__all__"


class LoanRecommendationSerializer(serializers.ModelSerializer):
    provider = LoanProviderSerializer()

    class Meta:
        model = LoanRecommendation
        fields = "__all__"


class EmiCalculatorSerializer(serializers.Serializer):
    principal = serializers.DecimalField(max_digits=14, decimal_places=2)
    annual_rate = serializers.DecimalField(max_digits=6, decimal_places=2)
    tenure_months = serializers.IntegerField(min_value=1, max_value=600)


class LoanApplicationSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.name", read_only=True)
    applicant_email = serializers.CharField(source="user.email", read_only=True)
    applicant_username = serializers.CharField(source="user.username", read_only=True)
    provider_interest_rate = serializers.DecimalField(
        source="provider.interest_rate",
        max_digits=6,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = LoanApplication
        fields = (
            "id",
            "provider",
            "provider_name",
            "applicant_email",
            "applicant_username",
            "provider_interest_rate",
            "amount_requested",
            "tenure_months",
            "note",
            "salary_slip_image_url",
            "status",
            "created_at",
        )
        read_only_fields = ("status", "created_at", "salary_slip_image_url")
