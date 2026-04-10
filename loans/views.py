from rest_framework import generics, permissions
from rest_framework.response import Response

from loans.models import LoanProvider
from loans.serializers import EmiCalculatorSerializer, LoanProviderSerializer
from services.financial_health import calculate_emi, generate_loan_recommendations


class EmiCalculatorView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EmiCalculatorSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        emi = calculate_emi(
            principal=data["principal"],
            annual_rate=data["annual_rate"],
            tenure_months=data["tenure_months"],
        )
        return Response({"emi": emi, **data})


class LoanProviderListView(generics.ListAPIView):
    queryset = LoanProvider.objects.filter(active=True)
    serializer_class = LoanProviderSerializer


class LoanRecommendationView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recommendations = generate_loan_recommendations(request.user)
        return Response(recommendations)
