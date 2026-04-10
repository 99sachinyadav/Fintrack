from rest_framework import serializers

from transactions.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = (
            "id",
            "provider",
            "external_id",
            "amount",
            "category",
            "transaction_type",
            "status",
            "currency",
            "description",
            "occurred_at",
            "metadata",
            "created_at",
        )
        read_only_fields = ("provider", "external_id", "status", "created_at")


class ManualTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = (
            "amount",
            "category",
            "transaction_type",
            "currency",
            "description",
            "occurred_at",
            "metadata",
        )

    def create(self, validated_data):
        return Transaction.objects.create(
            user=self.context["request"].user,
            provider=Transaction.Provider.MANUAL,
            status=Transaction.Status.SUCCESS,
            **validated_data,
        )
