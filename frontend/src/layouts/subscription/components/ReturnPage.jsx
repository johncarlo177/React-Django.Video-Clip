import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "libs/axios";
import { CircularProgress, Fade, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function ReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending"); // pending | success | error
  const [message, setMessage] = useState("Checking payment status...");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      axiosInstance
        .get(`/api/payment/verify-session/${sessionId}/`)
        .then((res) => {
          if (res.data.status === "paid") {
            setStatus("success");
            setMessage("Payment successful! Thank you for subscribing.");
          } else {
            setStatus("pending");
            setMessage("Payment is still pending...");
          }
        })
        .catch(() => {
          setStatus("error");
          setMessage("⚠️ Error verifying payment.");
        });
    }
  }, [sessionId]);

  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircleIcon,
          gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          title: "Payment Successful!",
          description: "Your subscription has been activated successfully.",
          buttonText: "Go to Upload",
          buttonColor: "success",
          buttonAction: () => navigate("/upload"),
        };
      case "error":
        return {
          icon: ErrorIcon,
          gradient: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
          title: "Payment Verification Failed",
          description: "We couldn&apos;t verify your payment. Please try again.",
          buttonText: "Retry",
          buttonColor: "error",
          buttonAction: () => window.location.reload(),
        };
      case "pending":
      default:
        return {
          icon: HourglassEmptyIcon,
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          title: "Processing Payment",
          description: "Please wait while we verify your payment...",
          buttonText: null,
          buttonColor: null,
          buttonAction: null,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const IconComponent = statusConfig.icon;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          px: { xs: 2, md: 4 },
          py: 4,
        }}
      >
        <MDBox
          sx={{
            maxWidth: 600,
            width: "100%",
          }}
        >
          <Fade in timeout={500}>
            <MDBox
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                bgColor: "white",
                overflow: "hidden",
              }}
            >
              {/* Header with Gradient */}
              <MDBox
                sx={{
                  background: statusConfig.gradient,
                  p: 4,
                  textAlign: "center",
                }}
              >
                <MDBox
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    bgcolor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    animation: status === "pending" ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%, 100%": {
                        transform: "scale(1)",
                      },
                      "50%": {
                        transform: "scale(1.05)",
                      },
                    },
                  }}
                >
                  {status === "pending" ? (
                    <CircularProgress size={60} sx={{ color: "info.main" }} />
                  ) : (
                    <IconComponent
                      sx={{
                        fontSize: 64,
                        color:
                          status === "success"
                            ? "#11998e"
                            : status === "error"
                            ? "#eb3349"
                            : "#f5576c",
                      }}
                    />
                  )}
                </MDBox>
                <MDTypography variant="h3" fontWeight="bold" color="white" mb={1}>
                  {statusConfig.title}
                </MDTypography>
                <MDTypography variant="body1" color="white" opacity={0.9}>
                  {statusConfig.description}
                </MDTypography>
              </MDBox>

              {/* Content Section */}
              <MDBox p={4}>
                {/* Status Message */}
                <Fade in timeout={600}>
                  <MDBox mb={3}>
                    {status === "success" && (
                      <Alert
                        severity="success"
                        icon={<CheckCircleIcon />}
                        sx={{
                          borderRadius: 2,
                          "& .MuiAlert-icon": {
                            fontSize: "1.5rem",
                          },
                        }}
                      >
                        <MDTypography variant="body2" fontWeight="medium">
                          {message}
                        </MDTypography>
                      </Alert>
                    )}

                    {status === "error" && (
                      <Alert
                        severity="error"
                        icon={<ErrorIcon />}
                        sx={{
                          borderRadius: 2,
                          "& .MuiAlert-icon": {
                            fontSize: "1.5rem",
                          },
                        }}
                      >
                        <MDTypography variant="body2" fontWeight="medium">
                          {message}
                        </MDTypography>
                      </Alert>
                    )}

                    {status === "pending" && (
                      <MDBox
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          py: 2,
                        }}
                      >
                        <MDTypography variant="body1" fontWeight="medium" color="text">
                          {message}
                        </MDTypography>
                        <CircularProgress size={40} sx={{ color: "info.main" }} />
                      </MDBox>
                    )}
                  </MDBox>
                </Fade>

                {/* Additional Info */}
                {status === "success" && (
                  <Fade in timeout={800}>
                    <MDBox
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        mb: 3,
                      }}
                    >
                      <MDTypography variant="body2" color="text.secondary" textAlign="center">
                        You can now upload videos and create stock clips. Your subscription credits
                        have been added to your account.
                      </MDTypography>
                    </MDBox>
                  </Fade>
                )}

                {/* Action Button */}
                {statusConfig.buttonText && (
                  <Fade in timeout={1000}>
                    <MDBox display="flex" justifyContent="center" mt={3}>
                      <MDButton
                        variant="gradient"
                        color={statusConfig.buttonColor}
                        onClick={statusConfig.buttonAction}
                        startIcon={
                          status === "success" ? (
                            <CloudUploadIcon />
                          ) : status === "error" ? (
                            <RefreshIcon />
                          ) : null
                        }
                        sx={{
                          px: 4,
                          py: 1.5,
                          minWidth: "200px",
                          fontSize: "1rem",
                          fontWeight: 600,
                          boxShadow:
                            status === "success"
                              ? "0 4px 12px rgba(46, 125, 50, 0.4)"
                              : "0 4px 12px rgba(244, 67, 54, 0.4)",
                          "&:hover": {
                            boxShadow:
                              status === "success"
                                ? "0 6px 16px rgba(46, 125, 50, 0.5)"
                                : "0 6px 16px rgba(244, 67, 54, 0.5)",
                          },
                        }}
                      >
                        {statusConfig.buttonText}
                      </MDButton>
                    </MDBox>
                  </Fade>
                )}
              </MDBox>
            </MDBox>
          </Fade>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default ReturnPage;
