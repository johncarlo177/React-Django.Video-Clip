import React, { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import axiosInstance from "libs/axios";
import { Box, Typography } from "@mui/material";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function useQuery() {
  return new URLSearchParams(window.location.search);
}

function CheckoutPage() {
  const location = useLocation();
  const query = useQuery();
  const plan = location.state?.plan;
  const minutes = location.state?.videoLength || 0;

  // Fallback: derive minimal plan info from query param
  const planTitle = plan?.title || query.get("title");

  const fetchClientSecret = useCallback(async () => {
    const response = await axiosInstance.post("/api/payment/create-checkout-session/", {
      plan: { title: planTitle },
      minutes,
    });
    return response.data.clientSecret;
  }, [planTitle, minutes]);

  if (!planTitle) {
    return <Typography>No plan selected.</Typography>;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box
        sx={{
          backgroundColor: "#fff",
          padding: 3,
          borderRadius: 2,
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
          <EmbeddedCheckout
            onComplete={(session) => {
              console.log("Payment complete!", session);
              // Redirect programmatically to your return page
              window.location.href = `/subscription/checkout-return?session_id=${session.id}`;
            }}
          />
        </EmbeddedCheckoutProvider>
      </Box>
    </DashboardLayout>
  );
}

export default CheckoutPage;
