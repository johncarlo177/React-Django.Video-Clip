import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Divider } from "@mui/material";
import { CheckCircle, Rocket, Star, Diamond } from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "libs/axios";

const plans = [
  {
    title: "Free Trial",
    price: "Free",
    description: "Upload 1 video for free to try our service.",
    details: [
      "1 free upload (up to 10 minutes)",
      "Full access to AI processing",
      "No credit card required",
    ],
    icon: <CheckCircle sx={{ fontSize: 40, color: "#4caf50" }} />,
    buttonText: "Free Trial",
    color: "#e8f5e9",
    router: "/upload",
  },
  {
    title: "Pay-as-you-go",
    price: "$1/min (min $5)",
    description: "Perfect for occasional uploads.",
    details: [
      "Pay only for what you use",
      "No monthly commitment",
      "Ideal for freelancers or small teams",
    ],
    icon: <Rocket sx={{ fontSize: 40, color: "#2196f3" }} />,
    buttonText: "Pay",
    color: "#e3f2fd",
    router: "/subscription/checkout",
  },
  {
    title: "Monthly",
    price: "$49/month",
    description: "Best for active creators who upload frequently.",
    details: ["Unlimited uploads", "Priority AI processing", "Cancel anytime"],
    icon: <Star sx={{ fontSize: 40, color: "#ffb300" }} />,
    buttonText: "Subscribe",
    color: "#fff8e1",
    router: "/subscription/checkout",
  },
  {
    title: "Yearly",
    price: "$500/year",
    description: "Get the best value with annual billing.",
    details: ["Unlimited uploads", "Priority AI processing", "Save 15% compared to monthly plan"],
    icon: <Diamond sx={{ fontSize: 40, color: "#9c27b0" }} />,
    buttonText: "Subscribe",
    color: "#f3e5f5",
    router: "/subscription/checkout",
  },
];

function Billing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePlan, setActivePlan] = useState(null);
  const videoLength = location.state?.videoLength || 0;

  const handleSelectPlan = (plan) => {
    navigate(`${plan.router}?title=${encodeURIComponent(plan.title)}&minutes=${videoLength}`, {
      state: { plan },
    });
  };

  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        const res = await axiosInstance.get("/api/payment/get-active-plan/");
        if (res.data.has_active_plan) {
          setActivePlan(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch active plan:", err);
      }
    };

    fetchActivePlan();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ p: 4 }}>
        {videoLength > 0 && (
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              borderRadius: 3,
              textAlign: "center",
              color: "red",
            }}
          >
            Great start! You’ve used your free upload. Upgrade now to keep creating and uploading
            more videos.
          </Typography>
        )}
        {activePlan && (
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            Your{" "}
            <strong>
              {activePlan.plan.charAt(0).toUpperCase() + activePlan.plan.slice(1)} Plan
            </strong>{" "}
            is active. Enjoy unlimited access until{" "}
            <strong>
              {new Date(activePlan.expires_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </strong>
            .
          </Typography>
        )}
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}>
          Choose Your Plan
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "text.secondary", mb: 5, textAlign: "center" }}
        >
          Flexible plans for creators of all levels. Upgrade anytime.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  backgroundColor: plan.color,
                  boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box sx={{ mb: 2 }}>{plan.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {plan.title}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                    {plan.price}
                  </Typography>
                  {plan.title === "Pay-as-you-go" && videoLength > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Estimated: ${Math.max(videoLength, 5)} for {videoLength} min Video
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {plan.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ textAlign: "left", px: 2 }}>
                    {plan.details.map((item, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 18, color: "#4caf50" }} />
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={
                      (activePlan?.plan === "monthly" && plan.title === "Monthly") ||
                      (activePlan?.plan === "yearly" && ["Monthly", "Yearly"].includes(plan.title))
                    }
                    sx={{
                      borderRadius: 3,
                      py: 1.2,
                      backgroundColor:
                        (activePlan?.plan === "monthly" && plan.title === "Monthly") ||
                        (activePlan?.plan === "yearly" &&
                          ["Monthly", "Yearly"].includes(plan.title))
                          ? "#B0BEC5" // gray when disabled
                          : "#1976d2",
                      color: "white !important",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor:
                          (activePlan?.plan === "monthly" && plan.title === "Monthly") ||
                          (activePlan?.plan === "yearly" &&
                            ["Monthly", "Yearly"].includes(plan.title))
                            ? "#B0BEC5"
                            : "#115293",
                      },
                    }}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {(activePlan?.plan === "monthly" && plan.title === "Monthly") ||
                    (activePlan?.plan === "yearly" && ["Monthly", "Yearly"].includes(plan.title))
                      ? "Already Active"
                      : plan.buttonText}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

export default Billing;
