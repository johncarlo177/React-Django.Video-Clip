import os
import stripe
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import Payment
from django.contrib.auth import get_user_model

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
User = get_user_model()

# -------------------------------
# 1️⃣ Create Checkout Session
# -------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    user = request.user
    plan = request.data.get("plan", {})
    plan_type = plan.get("title", "").lower()
    minutes = int(request.data.get("minutes", 0))

    try:
        # --------------------------
        # Pay-as-you-go
        # --------------------------
        if plan_type == "pay-as-you-go":
            amount = max(minutes, 5) * 1.00  # $1/min, min $5

            session = stripe.checkout.Session.create(
                ui_mode="embedded",
                customer_email=user.email,
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {"name": "Pay-as-you-go Upload"},
                            "unit_amount": int(amount * 100),
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                metadata={
                    "user_id": user.id,
                    "plan": "pay_per_minute",
                    "amount": str(amount),
                },
                return_url=os.getenv("FRONTEND_URL") + "/subscription/checkout-return?session_id={CHECKOUT_SESSION_ID}",
            )

            return Response({"clientSecret": session.client_secret})

        # --------------------------
        # Subscription (Monthly / Yearly)
        # --------------------------
        if plan_type in ["monthly", "yearly"]:
            price_id = (
                os.getenv("STRIPE_MONTHLY_PRICE_ID")
                if plan_type == "monthly"
                else os.getenv("STRIPE_YEARLY_PRICE_ID")
            )

            amount = 49 if plan_type == "monthly" else 500

            session = stripe.checkout.Session.create(
                ui_mode="embedded",
                customer_email=user.email,
                line_items=[{"price": price_id, "quantity": 1}],
                mode="subscription",
                metadata={
                    "user_id": user.id,
                    "plan": plan_type,
                    "amount": str(amount),
                },
                return_url=os.getenv("FRONTEND_URL") + "/subscription/checkout-return?session_id={CHECKOUT_SESSION_ID}",
            )

            return Response({"clientSecret": session.client_secret})

        return Response({"error": f"Invalid plan type: {plan_type}"}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# -------------------------------
# 2️⃣ Stripe Webhook
# -------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        return Response(status=400)

    # Handle successful payment
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        user_id = session.get("metadata", {}).get("user_id")
        plan = session.get("metadata", {}).get("plan")
        amount = session.get("metadata", {}).get("amount")
        payment_intent = session.get("payment_intent")

        user = User.objects.filter(id=user_id).first()
        if user:
            Payment.objects.create(
                user=user,
                plan=plan,
                amount=amount,
                stripe_session_id=session["id"],
                stripe_payment_intent=payment_intent,
                status="paid",
                created_at=timezone.now(),
            )

    return Response(status=200)


# -------------------------------
# 3️⃣ Optional: Verify Session
# -------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verify_session(request, session_id):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        payment = Payment.objects.filter(stripe_session_id=session_id).first()

        if not payment:
            return Response({"status": "pending"})

        return Response({
            "status": payment.status,
            "plan": payment.plan,
            "amount": payment.amount,
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)

