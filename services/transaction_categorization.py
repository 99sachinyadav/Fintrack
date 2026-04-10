def categorize_transaction(description="", merchant_name="", metadata=None, incoming=False):
    metadata = metadata or {}
    category = (metadata.get("category") or "").strip().lower()
    if category:
        return category.title()

    source = " ".join(
        [
            str(description or ""),
            str(merchant_name or ""),
            str(metadata.get("merchant") or ""),
            str(metadata.get("purpose") or ""),
        ]
    ).lower()

    if incoming:
        if "salary" in source or "payroll" in source:
            return "Salary"
        return "Income"

    rules = {
        "Food": ["restaurant", "food", "cafe", "swiggy", "zomato"],
        "Shopping": ["store", "shop", "amazon", "flipkart", "mall"],
        "Bills": ["bill", "electricity", "water", "gas", "internet", "utility"],
        "Investment": ["stock", "crypto", "gold", "invest", "broker"],
        "Subscription": ["subscription", "netflix", "spotify", "saas", "monthly"],
    }
    for label, keywords in rules.items():
        if any(word in source for word in keywords):
            return label
    return "Other"
