from django.contrib import admin

from users.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "income", "savings", "risk_appetite")
    search_fields = ("email", "username")
