from decimal import Decimal

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from loans.models import LoanApplication, LoanProvider
from loans.serializers import (
    EmiCalculatorSerializer,
    LoanApplicationSerializer,
    LoanProviderSerializer,
)
from services.financial_health import calculate_emi, generate_loan_recommendations


class IsLoanProviderOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in {"loan_provider", "admin"}
        )


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


class LoanAdviceView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recommendations = generate_loan_recommendations(request.user)
        if not recommendations:
            return Response(
                {
                    "should_take_loan": False,
                    "reason": "Current financial posture does not support safe borrowing.",
                    "range": {"min": 0, "max": 0},
                    "suggested_options": [],
                }
            )

        safe = [item for item in recommendations if item["trust_score"] >= 65]
        if not safe:
            return Response(
                {
                    "should_take_loan": False,
                    "reason": "Available offers are high risk at the moment.",
                    "range": {"min": 0, "max": 0},
                    "suggested_options": recommendations[:3],
                }
            )
        amounts = [item["eligible_amount"] for item in safe]
        return Response(
            {
                "should_take_loan": True,
                "reason": "You have safe options with acceptable trust scores.",
                "range": {"min": min(amounts), "max": max(amounts)},
                "suggested_options": safe[:5],
            }
        )


class LoanProviderDashboardView(generics.ListCreateAPIView):
    serializer_class = LoanProviderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return LoanProvider.objects.all()
        return LoanProvider.objects.filter(created_by=user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsLoanProviderOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class LoanApplicationView(generics.ListCreateAPIView):
    serializer_class = LoanApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "loan_provider":
            return LoanApplication.objects.filter(provider__created_by=user).select_related("provider", "user")
        return LoanApplication.objects.filter(user=user).select_related("provider", "user")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LoanApplicationStatusView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsLoanProviderOrAdmin]

    def post(self, request, pk):
        application = get_object_or_404(
            LoanApplication.objects.select_related("provider", "user"),
            pk=pk,
        )

        if request.user.role != "admin" and application.provider.created_by_id != request.user.id:
            return Response(
                {"detail": "You can only review applications for your own offers."},
                status=status.HTTP_403_FORBIDDEN,
            )

        decision = str(request.data.get("status", "")).lower()
        if decision not in {
            LoanApplication.Status.APPROVED,
            LoanApplication.Status.REJECTED,
        }:
            return Response(
                {"detail": "Status must be approved or rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if application.status == decision:
            return Response(LoanApplicationSerializer(application).data)

        application.status = decision
        application.save(update_fields=["status"])

        if decision == LoanApplication.Status.APPROVED:
            borrower = application.user
            emi = calculate_emi(
                principal=application.amount_requested,
                annual_rate=application.provider.interest_rate,
                tenure_months=application.tenure_months,
            )
            borrower.liabilities = (borrower.liabilities or Decimal("0.00")) + application.amount_requested
            borrower.monthly_loan_obligation = (
                borrower.monthly_loan_obligation or Decimal("0.00")
            ) + emi
            borrower.save(update_fields=["liabilities", "monthly_loan_obligation"])

        return Response(LoanApplicationSerializer(application).data)
