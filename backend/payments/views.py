import stripe, os
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Payment
from datetime import timedelta
from django.utils import timezone

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    user = request.user
    plan_type = request.data.get("plan")
    minutes = int(request.data.get("minutes", 0))

    try:
        # Trial check
        if plan_type == "trial":
            payment = Payment.objects.create(
                user=user, plan="trial", amount=0, status="paid"
            )
            return Response({"trial": True, "message": "Free trial activated"})

        # Calculate amount
        if plan_type == "pay_per_minute":
            amount = max(minutes, 5) * 1.00  # $1 per minute, min $5
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                customer_email=user.email,
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {"name": "Pay-per-minute Upload"},
                            "unit_amount": int(amount * 100),
                        },
                        "quantity": 1,
                    }
                ],
                success_url=os.getenv("FRONTEND_URL") + "/payment-success",
                cancel_url=os.getenv("FRONTEND_URL") + "/payment-cancel",
            )
            Payment.objects.create(
                user=user, plan="pay_per_minute", amount=amount, stripe_session_id=session.id
            )
            return Response({"sessionId": session.id})

        # Subscription plans
        if plan_type in ["monthly", "yearly"]:
            price_id = (
                os.getenv("STRIPE_MONTHLY_PRICE_ID") if plan_type == "monthly"
                else os.getenv("STRIPE_YEARLY_PRICE_ID")
            )
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="subscription",
                customer_email=user.email,
                line_items=[{"price": price_id, "quantity": 1}],
                success_url=os.getenv("FRONTEND_URL") + "/payment-success",
                cancel_url=os.getenv("FRONTEND_URL") + "/payment-cancel",
            )
            Payment.objects.create(
                user=user, plan=plan_type, amount=0, stripe_session_id=session.id
            )
            return Response({"sessionId": session.id})

        return Response({"error": "Invalid plan type"}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
