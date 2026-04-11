import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fintech.settings')
django.setup()

from loans.models import LoanApplication
apps = LoanApplication.objects.all().order_by('-created_at')[:5]

print("Total Applications:", LoanApplication.objects.count())
for app in apps:
    print(f"ID: {app.id}, AMOUNT: {app.amount_requested}, STATUS: {app.status}, SLIP_URL: '{app.salary_slip_image_url}'")
