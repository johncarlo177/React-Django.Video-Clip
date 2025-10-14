import React from "react";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import axiosInstance from "libs/axios";
import { Button, Box, Typography } from "@mui/material";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_...");

export default function Payment({ plan = "pay_per_minute", minutes = 5 }) {
  const handleCheckout = async () => {
    try {
      const res = await axiosInstance.post("/api/payments/create-checkout-session/", {
        plan,
        minutes,
      });
      const { sessionId } = res.data;

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error("Stripe checkout error:", err);
    }
  };

  return (
    <Box textAlign="center" mt={3}>
      <Typography variant="h6" gutterBottom>
        Proceed with Payment
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCheckout}>
        Pay Now
      </Button>
    </Box>
  );
}

Payment.propTypes = {
  plan: PropTypes.string,
  minutes: PropTypes.number,
};
