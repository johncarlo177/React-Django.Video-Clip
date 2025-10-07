import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  LinearProgress,
  Box,
} from "@mui/material";
import MDButton from "components/MDButton";
import axiosInstance from "libs/axios";

export default function AdvancedSettings({ open, onClose, video }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const isCancelled = useRef(false);
  const [keywords, setKeywords] = useState([]);

  // ✅ Stop polling and reset when dialog closes
  const handleClose = () => {
    isCancelled.current = true;
    setLoading(false);
    setStatus("");
    onClose();
    setKeywords([]);
  };

  const handleTranscribe = async () => {
    if (!video) return;

    try {
      isCancelled.current = false;
      setLoading(true);
      setStatus("Starting transcription...");

      // Step 1: Start transcription
      const startRes = await axiosInstance.post(`/api/transcribe/${video.id}/`);
      const jobId = startRes.data.job?.id;
      if (!jobId) throw new Error("No job ID returned");

      setStatus("Transcription started. Waiting for completion...");

      // Step 2: Polling function
      const pollTranscription = async (attempt = 0) => {
        if (isCancelled.current) return;

        try {
          const statusRes = await axiosInstance.get(`/api/transcribe/status/${jobId}/`);
          const data = statusRes.data;
          setStatus(`Attempt ${attempt + 1}: ${data.state}`);

          if (data.state === "automatic_done") {
            setStatus("✅ Transcription complete!");
            await handleKeywordDetection(video.id);
            setLoading(false);
          } else if (["error", "failed"].includes(data.state)) {
            setStatus("❌ Transcription failed");
            setLoading(false);
          } else {
            setTimeout(() => pollTranscription(attempt + 1), 10000);
          }
        } catch (err) {
          if (!isCancelled.current) {
            console.error("Polling error:", err);
            setStatus("⚠️ Error checking status");
            setLoading(false);
          }
        }
      };

      pollTranscription();
    } catch (err) {
      if (!isCancelled.current) {
        console.error("Error starting transcription:", err);
        setStatus("❌ Failed to start transcription");
        setLoading(false);
      }
    }
  };

  // Keyword detection step
  const handleKeywordDetection = async (videoId) => {
    try {
      setStatus("🔍 Detecting keywords with AI...");
      const res = await axiosInstance.post(`/api/keyword-detection/${videoId}/`);
      setKeywords(res.data.keywords || []);
      setStatus("✅ Keyword detection complete!");
    } catch (err) {
      console.error("Keyword detection failed:", err);
      setStatus("❌ Keyword detection failed");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { padding: "1rem" } }}
    >
      <DialogTitle>Advanced Settings</DialogTitle>
      <DialogContent sx={{ overflowX: "hidden" }}>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: "bold" }}>
          {video?.file_name}
        </Typography>
        <Typography>
          1. Transcription
          {loading && (
            <Box sx={{ width: "100%", mb: 2 }}>
              <LinearProgress sx={{ width: "100%", overflowX: "hidden" }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {status}
              </Typography>
            </Box>
          )}
          {!loading && status && <Typography variant="body2">{status}</Typography>}
        </Typography>
        <Typography>2. Keyword Detection</Typography>
        <Typography>3. Clip Video</Typography>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={handleClose} color="secondary">
          Close
        </MDButton>
        <MDButton onClick={handleTranscribe} color="info" disabled={loading}>
          {loading ? "Processing..." : "Start"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

AdvancedSettings.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  video: PropTypes.shape({
    id: PropTypes.number,
    file_name: PropTypes.string,
  }),
};
