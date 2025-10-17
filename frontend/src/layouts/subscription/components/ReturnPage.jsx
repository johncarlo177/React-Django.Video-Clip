import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "libs/axios";
import { Box, Typography, CircularProgress, Paper, Button, Stack } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function ReturnPage() {
  const [searchParams] = useSearchParams();
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
            setMessage("⏳ Payment is still pending...");
          }
        })
        .catch(() => {
          setStatus("error");
          setMessage("⚠️ Error verifying payment.");
        });
    }
  }, [sessionId]);

  const renderIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "#4caf50" }} />;
      case "error":
        return <ErrorOutlineIcon sx={{ fontSize: 80, color: "#f44336" }} />;
      case "pending":
      default:
        return <HourglassEmptyIcon sx={{ fontSize: 80, color: "#ff9800" }} />;
    }
  };

  const renderActionButton = () => {
    if (status === "success") {
      return (
        <Button variant="contained" color="primary" sx={{ mt: 4, color: "#fff" }} href="/upload">
          Go to Upload
        </Button>
      );
    } else if (status === "error") {
      return (
        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 4 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      );
    }
    return null; // no button for pending
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          px: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            maxWidth: 500,
            width: "100%",
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
          }}
        >
          <Stack spacing={3} alignItems="center">
            {renderIcon()}
            <Typography variant="h5" fontWeight="bold">
              {message}
            </Typography>
            {status === "pending" && <CircularProgress sx={{ mt: 2 }} />}
            {renderActionButton()}
          </Stack>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}

export default ReturnPage;
