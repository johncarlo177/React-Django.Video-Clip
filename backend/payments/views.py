import os
import stripe
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Payment

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    user = request.user
    plan = request.data.get("plan", {})
    plan_type = plan.get("title", "").lower()
    minutes = int(request.data.get("minutes", 0))

    try:
        # --------------------------------------
        # 2. Pay-as-you-go
        # --------------------------------------
        if plan_type == "pay-as-you-go":
            amount = max(minutes, 5) * 1.00  # $1/min, min $5

            session = stripe.checkout.Session.create(
                ui_mode="embedded",  # ✅ Required for EmbeddedCheckout
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
                return_url=os.getenv("FRONTEND_URL")
                + "/return?session_id={CHECKOUT_SESSION_ID}",
            )

            Payment.objects.create(
                user=user,
                plan="pay_per_minute",
                amount=amount,
                stripe_session_id=session.id,
            )

            return Response({"clientSecret": session.client_secret})

        # --------------------------------------
        # 3. Subscription (Monthly / Yearly)
        # --------------------------------------
        if plan_type in ["monthly", "yearly"]:
            price_id = (
                os.getenv("STRIPE_MONTHLY_PRICE_ID")
                if plan_type == "monthly"
                else os.getenv("STRIPE_YEARLY_PRICE_ID")
            )

            amount = 49 if plan_type == "monthly" else 500

            session = stripe.checkout.Session.create(
                ui_mode="embedded",  # ✅ Required for EmbeddedCheckout
                customer_email=user.email,
                line_items=[{"price": price_id, "quantity": 1}],
                mode="subscription",
                return_url=os.getenv("FRONTEND_URL")
                + "/return?session_id={CHECKOUT_SESSION_ID}",
            )

            Payment.objects.create(
                user=user,
                plan=plan_type,
                amount=amount,
                stripe_session_id=session.id,
            )

            return Response({"clientSecret": session.client_secret})

        return Response({"error": f"Invalid plan type: {plan_type}"}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
