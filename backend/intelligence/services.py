from datetime import date, timedelta
from django.db.models import Sum
from django.utils import timezone
from finance.models import Expense, Budget, Category

class FinanceIntelligence:
    def __init__(self, user):
        self.user = user
        self.today = timezone.now().date()
        self.current_month_start = self.today.replace(day=1)

    def get_monthly_spending(self):
        expenses = Expense.objects.filter(
            user=self.user,
            date__gte=self.current_month_start
        ).values('category__name').annotate(total=Sum('amount'))
        return expenses

    def detect_overspending(self):
        alerts = []
        budgets = Budget.objects.filter(user=self.user, month=self.current_month_start)
        
        # Calculate spending per category for this month
        spending_map = {}
        expenses = self.get_monthly_spending()
        for e in expenses:
            spending_map[e['category__name']] = e['total']

        for budget in budgets:
            category_name = budget.category.name
            spent = spending_map.get(category_name, 0)
            if spent > budget.amount:
                alerts.append({
                    'type': 'OVERSPENDING',
                    'category': category_name,
                    'budget': float(budget.amount),
                    'spent': float(spent),
                    'message': f"You have exceeded your {category_name} budget by {float(spent - budget.amount):.2f}"
                })
        return alerts

    def predict_overrun(self):
        predictions = []
        budgets = Budget.objects.filter(user=self.user, month=self.current_month_start)
        
        spending_map = {}
        expenses = self.get_monthly_spending()
        for e in expenses:
            spending_map[e['category__name']] = e['total']
            
        days_passed = self.today.day
        # Avoid division by zero if it's the first day, treat as 1
        days_passed = max(days_passed, 1)
        
        # Days in current month
        next_month = (self.current_month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
        days_in_month = (next_month - self.current_month_start).days
        
        for budget in budgets:
            category_name = budget.category.name
            spent = spending_map.get(category_name, 0)
            
            # Simple linear projection
            daily_avg = spent / days_passed
            projected_total = daily_avg * days_in_month
            
            if projected_total > budget.amount and spent <= budget.amount:
                 predictions.append({
                    'type': 'PREDICTED_OVERRUN',
                    'category': category_name,
                    'budget': float(budget.amount),
                    'current_spent': float(spent),
                    'projected': float(projected_total),
                    'message': f"At current rate, you will exceed {category_name} budget by {float(projected_total - budget.amount):.2f}"
                })
        return predictions

    def get_insights(self):
        return {
            'overspending': self.detect_overspending(),
            'predictions': self.predict_overrun(),
        }
