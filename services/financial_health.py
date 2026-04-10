from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Sum

from loans.models import LoanProvider
from transactions.models import Transaction


def calculate_emi(principal, annual_rate, tenure_months):
    principal = Decimal(principal)
    annual_rate = Decimal(annual_rate)
    tenure_months = int(tenure_months)
    monthly_rate = annual_rate / Decimal("1200")
    if monthly_rate == 0:
        return (principal / Decimal(tenure_months)).quantize(Decimal("0.01"))
    factor = (Decimal("1") + monthly_rate) ** tenure_months
    emi = principal * monthly_rate * factor / (factor - Decimal("1"))
    return emi.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def evaluate_financial_health(user, assets):
    income = user.income or Decimal("0.00")
    expenses = (
        Transaction.objects.filter(
            user=user,
            transaction_type=Transaction.TransactionType.EXPENSE,
        ).aggregate(total=Sum("amount"))["total"]
        if income
        else Decimal("0.00")
    )
    expenses = expenses or Decimal("0.00")
    savings_ratio = (user.savings / income) if income else Decimal("0.00")
    expense_ratio = (expenses / income) if income else Decimal("0.00")
    loan_burden = (user.monthly_loan_obligation / income) if income else Decimal("0.00")
    net_worth = assets + user.savings - user.liabilities

    if savings_ratio >= Decimal("0.45") and expense_ratio <= Decimal("0.45") and loan_burden <= Decimal("0.20"):
        score = "EXCELLENT"
    elif savings_ratio >= Decimal("0.30") and expense_ratio <= Decimal("0.60") and loan_burden <= Decimal("0.30"):
        score = "GOOD"
    elif savings_ratio >= Decimal("0.15") and expense_ratio <= Decimal("0.75") and loan_burden <= Decimal("0.40"):
        score = "AVERAGE"
    else:
        score = "POOR"

    return {
        "net_worth": net_worth,
        "savings_ratio": (savings_ratio * Decimal("100")).quantize(Decimal("0.01")),
        "expense_ratio": (expense_ratio * Decimal("100")).quantize(Decimal("0.01")),
        "loan_burden": (loan_burden * Decimal("100")).quantize(Decimal("0.01")),
        "score": score,
        "income": income,
        "savings": user.savings,
        "liabilities": user.liabilities,
        "monthly_loan_obligation": user.monthly_loan_obligation,
        "expenses": expenses,
        "assets": assets,
    }


def calculate_provider_trust_score(provider):
    rate_factor = max(Decimal("0"), Decimal("100") - (provider.interest_rate * Decimal("4")))
    reliability = Decimal(provider.reliability_factor)
    trust_score = ((rate_factor * Decimal("0.4")) + (reliability * Decimal("0.6"))).quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP,
    )
    return int(min(100, max(0, trust_score)))


def generate_loan_recommendations(user):
    income = user.income or Decimal("0.00")
    max_emi = income * Decimal("0.40")
    recommendations = []
    for provider in LoanProvider.objects.filter(active=True):
        trust_score = calculate_provider_trust_score(provider)
        for tenure in (12, 24, 36, min(60, provider.max_tenure_months)):
            emi_capacity = max_emi - user.monthly_loan_obligation
            if emi_capacity <= 0:
                continue
            monthly_rate = Decimal(provider.interest_rate) / Decimal("1200")
            if monthly_rate == 0:
                principal = emi_capacity * tenure
            else:
                factor = (Decimal("1") + monthly_rate) ** tenure
                principal = emi_capacity * (factor - Decimal("1")) / (monthly_rate * factor)
            emi = calculate_emi(principal, provider.interest_rate, tenure)
            if emi <= max_emi:
                recommendations.append(
                    {
                        "provider": {
                            "id": provider.id,
                            "name": provider.name,
                            "interest_rate": provider.interest_rate,
                            "reliability_factor": provider.reliability_factor,
                            "processing_fee": provider.processing_fee,
                        },
                        "eligible_amount": principal.quantize(Decimal("0.01")),
                        "emi": emi,
                        "tenure_months": tenure,
                        "trust_score": trust_score,
                        "status": "eligible",
                    }
                )
    recommendations.sort(key=lambda item: (-item["trust_score"], item["emi"]))
    return recommendations[:10]
