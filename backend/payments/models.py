from django.db import models
from django.conf import settings

class Payment(models.Model):
    PLAN_CHOICES = [
        ('trial', 'Trial'),
        ('pay_per_minute', 'Pay per Minute'),
        ('monthly', 'Monthly Subscription'),
        ('yearly', 'Yearly Subscription'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.CharField(max_length=50, choices=PLAN_CHOICES)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=50, default="pending")  # pending, paid, failed
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan} (${self.amount})"
