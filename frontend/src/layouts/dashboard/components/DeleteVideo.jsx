import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material";
import MDButton from "components/MDButton";
import axiosInstance from "libs/axios";

export default function DeleteVideo({ open, onClose, videoId }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleDeleteVideo = async () => {
    if (!videoId) return;
    try {
      setLoading(true);
      setStatus("Deleting video...");

      const res = await axiosInstance.delete(`/api/video-delete/${videoId}/`);
      console.log(res.data);
      setStatus("✅ Video deleted successfully!");

      // Give feedback, then refresh the page
      setTimeout(() => {
        setLoading(false);
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Failed to delete video:", err.response || err);
      setStatus("❌ Failed to delete video.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { padding: "1rem" } }}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this video? This action cannot be undone.
        </Typography>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", marginTop: 12, gap: 8 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">{status}</Typography>
          </div>
        )}

        {!loading && status && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {status}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <MDButton onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </MDButton>
        <MDButton onClick={handleDeleteVideo} color="error" disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

DeleteVideo.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  videoId: PropTypes.number,
};
