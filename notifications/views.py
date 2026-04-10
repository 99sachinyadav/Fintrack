from rest_framework import generics, permissions, status
from rest_framework.response import Response

from notifications.serializers import NotificationLogSerializer
from services.email_service import (
    send_loan_warning_email,
    send_monthly_expense_summary_email,
    send_profit_loss_report_email,
)
from notifications.models import NotificationLog


class MonthlyExpenseNotificationView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        result = send_monthly_expense_summary_email(request.user)
        return Response(result, status=status.HTTP_200_OK)


class ProfitLossNotificationView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        result = send_profit_loss_report_email(request.user)
        return Response(result, status=status.HTTP_200_OK)


class LoanWarningNotificationView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        result = send_loan_warning_email(request.user)
        return Response(result, status=status.HTTP_200_OK)


class NotificationLogListView(generics.ListAPIView):
    serializer_class = NotificationLogSerializer

    def get_queryset(self):
        return NotificationLog.objects.filter(user=self.request.user)
