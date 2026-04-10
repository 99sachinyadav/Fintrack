from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from users.models import User


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "role",
            "income",
            "savings",
            "liabilities",
            "monthly_loan_obligation",
            "risk_appetite",
            "trust_score",
        )
        read_only_fields = ("id", "trust_score")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "email",
            "username",
            "password",
            "role",
            "income",
            "savings",
            "liabilities",
            "monthly_loan_obligation",
            "risk_appetite",
        )
        extra_kwargs = {"role": {"required": False}}

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["risk_appetite"] = user.risk_appetite
        return token

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        data = super().validate({"email": email, "password": password})
        data["user"] = UserProfileSerializer(user).data
        return data
