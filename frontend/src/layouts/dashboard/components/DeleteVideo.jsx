import React, { useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, CircularProgress, Alert, Fade } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import axiosInstance from "libs/axios";

export default function DeleteVideo({ open, onClose, videoId }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);

  const handleDeleteVideo = async () => {
    if (!videoId) return;
    try {
      setLoading(true);
      setStatus("Deleting video...");
      setError(false);

      const res = await axiosInstance.delete(`/api/video-delete/${videoId}/`);
      console.log(res.data);
      setStatus("✅ Video deleted successfully!");
      setError(false);

      // Give feedback, then refresh the page
      setTimeout(() => {
        setLoading(false);
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Failed to delete video:", err.response || err);
      setStatus("❌ Failed to delete video.");
      setError(true);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStatus("");
      setError(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          overflow: "hidden",
        },
      }}
    >
      <MDBox
        sx={{
          background: error
            ? "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          p: 3,
          textAlign: "center",
        }}
      >
        <MDBox
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {loading ? (
            <CircularProgress size={40} sx={{ color: "error.main" }} />
          ) : error ? (
            <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />
          ) : (
            <WarningIcon sx={{ fontSize: 48, color: "warning.main" }} />
          )}
        </MDBox>
        <MDTypography variant="h4" fontWeight="bold" color="white" mb={1}>
          {error ? "Delete Failed" : loading ? "Deleting Video..." : "Delete Video?"}
        </MDTypography>
        <MDTypography variant="body2" color="white" opacity={0.9}>
          {error
            ? "An error occurred while deleting the video"
            : loading
            ? "Please wait while we delete your video"
            : "This action cannot be undone"}
        </MDTypography>
      </MDBox>

      <DialogContent sx={{ p: 4 }}>
        {!loading && !error && (
          <Fade in={!loading && !error}>
            <MDBox>
              <MDBox
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  mb: 3,
                }}
              >
                <DeleteIcon sx={{ color: "error.main", mt: 0.5 }} />
                <MDBox>
                  <MDTypography variant="body1" fontWeight="medium" color="text" mb={1}>
                    Are you sure you want to delete this video?
                  </MDTypography>
                  <MDTypography variant="body2" color="text.secondary">
                    Once deleted, you won&apos;t be able to recover this video or its associated
                    stock clips. All related data will be permanently removed.
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </Fade>
        )}

        {loading && (
          <Fade in={loading}>
            <MDBox>
              <MDBox
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  py: 3,
                }}
              >
                <CircularProgress size={50} sx={{ color: "error.main" }} />
                <MDTypography variant="body1" fontWeight="medium" color="text">
                  {status || "Deleting video..."}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Fade>
        )}

        {error && status && (
          <Fade in={error && !!status}>
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
                {status}
              </MDTypography>
            </Alert>
          </Fade>
        )}

        {!loading && !error && status && status.includes("✅") && (
          <Fade in={!loading && !error && status.includes("✅")}>
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
                {status}
              </MDTypography>
            </Alert>
          </Fade>
        )}
      </DialogContent>

      <MDBox
        sx={{
          p: 3,
          pt: 0,
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={handleClose}
          disabled={loading}
          sx={{
            px: 3,
            py: 1.5,
            minWidth: "120px",
          }}
        >
          Cancel
        </MDButton>
        <MDButton
          variant="gradient"
          color="error"
          onClick={handleDeleteVideo}
          disabled={loading}
          startIcon={!loading && <DeleteIcon />}
          sx={{
            px: 3,
            py: 1.5,
            minWidth: "120px",
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.4)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(244, 67, 54, 0.5)",
            },
            "&:disabled": {
              boxShadow: "none",
            },
          }}
        >
          {loading ? (
            <MDBox display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} color="inherit" />
              <span>Deleting...</span>
            </MDBox>
          ) : (
            "Delete Video"
          )}
        </MDButton>
      </MDBox>
    </Dialog>
  );
}

DeleteVideo.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  videoId: PropTypes.number,
};
