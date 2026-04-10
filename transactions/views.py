from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import generics, permissions
from rest_framework.response import Response

from transactions.models import Transaction
from transactions.serializers import ManualTransactionSerializer, TransactionSerializer


class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class ManualTransactionCreateView(generics.CreateAPIView):
    serializer_class = ManualTransactionSerializer


class MonthlyTransactionSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        monthly = (
            Transaction.objects.filter(user=request.user)
            .annotate(month=TruncMonth("occurred_at"))
            .values("month", "transaction_type")
            .annotate(total=Sum("amount"))
            .order_by("month", "transaction_type")
        )
        return Response(list(monthly))
