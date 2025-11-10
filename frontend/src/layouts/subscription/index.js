import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, Divider, Chip, Fade, Alert } from "@mui/material";
import {
  CheckCircle,
  Rocket,
  Star,
  Diamond,
  TrendingUp,
  AutoAwesome,
  WorkspacePremium,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "libs/axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const plans = [
  {
    title: "Free Trial",
    price: "Free",
    priceSubtext: "Forever",
    description: "Perfect for trying out our service",
    details: [
      "1 free upload (up to 10 minutes)",
      "Full access to AI processing",
      "No credit card required",
      "All features included",
    ],
    icon: <CheckCircle />,
    buttonText: "Start Free Trial",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    iconColor: "#11998e",
    popular: false,
    router: "/upload",
  },
  {
    title: "Pay-as-you-go",
    price: "$1/min",
    priceSubtext: "Minimum $5",
    description: "Perfect for occasional uploads",
    details: [
      "Pay only for what you use",
      "No monthly commitment",
      "Ideal for freelancers or small teams",
      "Flexible pricing",
    ],
    icon: <Rocket />,
    buttonText: "Get Started",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    iconColor: "#667eea",
    popular: false,
    router: "/subscription/checkout",
  },
  {
    title: "Monthly",
    price: "$49",
    priceSubtext: "per month",
    description: "Best for active creators",
    details: ["Unlimited uploads", "Priority AI processing", "Cancel anytime", "24/7 support"],
    icon: <Star />,
    buttonText: "Subscribe Now",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    iconColor: "#f5576c",
    popular: true,
    router: "/subscription/checkout",
  },
  {
    title: "Yearly",
    price: "$500",
    priceSubtext: "per year",
    description: "Best value with annual billing",
    details: [
      "Unlimited uploads",
      "Priority AI processing",
      "Save 15% vs monthly",
      "Best value option",
    ],
    icon: <Diamond />,
    buttonText: "Subscribe Now",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    iconColor: "#fda085",
    popular: false,
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

  const isPlanActive = (planTitle) => {
    if (!activePlan) return false;
    if (activePlan.plan === "monthly" && planTitle === "Monthly") return true;
    if (activePlan.plan === "yearly" && planTitle === "Yearly") return true;
    return false;
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        {/* Hero Section */}
        <MDBox
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 3,
            p: 6,
            mb: 4,
            textAlign: "center",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            },
          }}
        >
          <MDBox position="relative" zIndex={1}>
            <AutoAwesome sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <MDTypography variant="h2" fontWeight="bold" color="white" mb={2}>
              Choose Your Perfect Plan
            </MDTypography>
            <MDTypography variant="h6" color="white" opacity={0.9} fontWeight="regular">
              Flexible pricing for creators of all levels. Upgrade or downgrade anytime.
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Alert Messages */}
        <MDBox mb={4}>
          {videoLength > 0 && (
            <Fade in={videoLength > 0}>
              <Alert
                severity="info"
                icon={<TrendingUp />}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: 28,
                  },
                }}
              >
                <MDTypography variant="body2" fontWeight="medium">
                  Great start! You&apos;ve used your free upload. Upgrade now to keep creating and
                  uploading more videos.
                </MDTypography>
              </Alert>
            </Fade>
          )}
          {activePlan && (
            <Fade in={!!activePlan}>
              <Alert
                severity="success"
                icon={<WorkspacePremium />}
                sx={{
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: 28,
                  },
                }}
              >
                <MDTypography variant="body2" fontWeight="medium">
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
                </MDTypography>
              </Alert>
            </Fade>
          )}
        </MDBox>

        {/* Pricing Cards */}
        <Grid container spacing={3} justifyContent="center">
          {plans.map((plan, index) => {
            const isActive = isPlanActive(plan.title);
            return (
              <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
                <Fade in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      boxShadow: plan.popular
                        ? "0 12px 40px rgba(102, 126, 234, 0.3)"
                        : "0 8px 24px rgba(0,0,0,0.12)",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "visible",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: plan.popular ? "2px solid" : "1px solid",
                      borderColor: plan.popular ? "info.main" : "grey.300",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: plan.popular
                          ? "0 16px 48px rgba(102, 126, 234, 0.4)"
                          : "0 12px 32px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <Chip
                        label="Most Popular"
                        color="info"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: -12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontWeight: "bold",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                        }}
                      />
                    )}

                    {/* Gradient Header */}
                    <MDBox
                      sx={{
                        background: plan.gradient,
                        p: 3,
                        textAlign: "center",
                        color: "white",
                        borderRadius: "16px 16px 0 0",
                      }}
                    >
                      <MDBox
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          bgcolor: "rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 2,
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {React.cloneElement(plan.icon, {
                          sx: { fontSize: 32, color: "white" },
                        })}
                      </MDBox>
                      <MDTypography variant="h5" fontWeight="bold" color="white" mb={0.5}>
                        {plan.title}
                      </MDTypography>
                      <MDBox display="flex" alignItems="baseline" justifyContent="center" gap={0.5}>
                        <MDTypography variant="h3" fontWeight="bold" color="white">
                          {plan.price}
                        </MDTypography>
                        {plan.priceSubtext && (
                          <MDTypography variant="body2" color="white" opacity={0.9}>
                            /{plan.priceSubtext}
                          </MDTypography>
                        )}
                      </MDBox>
                      {plan.title === "Pay-as-you-go" && videoLength > 0 && (
                        <MDTypography
                          variant="caption"
                          color="white"
                          opacity={0.9}
                          mt={1}
                          display="block"
                        >
                          Estimated: ${Math.max(videoLength, 5)} for {videoLength} min video
                        </MDTypography>
                      )}
                    </MDBox>

                    <CardContent
                      sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}
                    >
                      <MDTypography
                        variant="body2"
                        color="text"
                        textAlign="center"
                        mb={3}
                        opacity={0.8}
                      >
                        {plan.description}
                      </MDTypography>

                      <Divider sx={{ my: 2 }} />

                      <MDBox sx={{ flexGrow: 1 }}>
                        {plan.details.map((item, i) => (
                          <MDBox key={i} display="flex" alignItems="center" gap={1.5} mb={1.5}>
                            <CheckCircle
                              sx={{
                                fontSize: 20,
                                color: "success.main",
                                flexShrink: 0,
                              }}
                            />
                            <MDTypography variant="body2" color="text" fontWeight="regular">
                              {item}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>

                      <MDBox mt={3}>
                        <MDButton
                          variant={plan.popular ? "gradient" : "contained"}
                          color={plan.popular ? "info" : "dark"}
                          fullWidth
                          disabled={isActive}
                          onClick={() => handleSelectPlan(plan)}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: "1rem",
                            fontWeight: 600,
                            textTransform: "none",
                            boxShadow: plan.popular
                              ? "0 4px 12px rgba(102, 126, 234, 0.4)"
                              : "0 4px 8px rgba(0,0,0,0.15)",
                            "&:hover": {
                              boxShadow: plan.popular
                                ? "0 6px 16px rgba(102, 126, 234, 0.5)"
                                : "0 6px 12px rgba(0,0,0,0.2)",
                            },
                            "&:disabled": {
                              bgcolor: "grey.300",
                              color: "grey.600",
                            },
                          }}
                        >
                          {isActive ? "Already Active" : plan.buttonText}
                        </MDButton>
                      </MDBox>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Billing;
