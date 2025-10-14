from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.utils import timezone
import stripe, os
import json

from rest_framework.decorators import api_view
from .models import Payment   # assuming you have a Payment model

# Initialize Stripe with your secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


@csrf_exempt
@api_view(["POST"])
def stripe_webhook(request):
    """Handle incoming Stripe webhook events."""
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    event = None

    try:
        # Verify the webhook signature using Stripe’s secret
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError as e:
        # Invalid JSON
        print("❌ Invalid payload", e)
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print("❌ Invalid signature", e)
        return HttpResponse(status=400)

    # ✅ Handle the event types you care about
    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        handle_checkout_session_completed(session)

    elif event_type == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        handle_invoice_payment_succeeded(invoice)

    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        handle_subscription_cancelled(subscription)

    else:
        print(f"Unhandled event type {event_type}")

    return HttpResponse(status=200)


def handle_checkout_session_completed(session):
    """Triggered when a checkout (one-time or subscription) completes."""
    print("✅ Checkout session completed:", session.get("id"))

    stripe_session_id = session.get("id")
    customer_email = session.get("customer_details", {}).get("email")

    # Update the Payment record (if exists)
    Payment.objects.filter(stripe_session_id=stripe_session_id).update(
        status="paid",
        paid_at=timezone.now(),
    )

    # You could also grant user access, send email, etc.
    print(f"💰 Payment completed for {customer_email}")


def handle_invoice_payment_succeeded(invoice):
    """Triggered when a recurring subscription payment succeeds."""
    customer_id = invoice.get("customer")
    print(f"🔁 Subscription payment succeeded for customer {customer_id}")


def handle_subscription_cancelled(subscription):
    """Triggered when a subscription is cancelled."""
    customer_id = subscription.get("customer")
    print(f"🛑 Subscription cancelled for customer {customer_id}")
