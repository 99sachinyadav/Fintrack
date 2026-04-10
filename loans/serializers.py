from rest_framework import serializers

from loans.models import LoanProvider, LoanRecommendation


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
