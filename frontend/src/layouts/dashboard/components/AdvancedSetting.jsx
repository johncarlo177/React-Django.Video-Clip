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
import { Padding } from "@mui/icons-material";

export default function AdvancedSettings({ open, onClose, video }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // ✅ Transcription logic now here
  const handleTranscribe = async () => {
    if (!video) return;

    try {
      setLoading(true);
      setStatus("Starting transcription...");

      // Step 1: Start transcription
      const startRes = await axiosInstance.post(`/api/transcribe/${video.id}/`);
      const jobId = startRes.data.job?.id;
      if (!jobId) throw new Error("No job ID returned");

      setStatus("Transcription started. Waiting for completion...");

      // Step 2: Polling function
      const pollTranscription = async (attempt = 0) => {
        try {
          const statusRes = await axiosInstance.get(`/api/transcribe/status/${jobId}/`);
          const data = statusRes.data;
          setStatus(`Attempt ${attempt + 1}: ${data.state}`);

          if (data.state === "automatic_done") {
            setStatus("✅ Transcription complete!");
            setLoading(false);
          } else if (["error", "failed"].includes(data.state)) {
            setStatus("❌ Transcription failed");
            setLoading(false);
          } else {
            setTimeout(() => pollTranscription(attempt + 1), 10000);
          }
        } catch (err) {
          console.error("Polling error:", err);
          setStatus("⚠️ Error checking status");
          setLoading(false);
        }
      };

      pollTranscription();
    } catch (err) {
      console.error("Error starting transcription:", err);
      setStatus("❌ Failed to start transcription");
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          padding: "1rem",
        },
      }}
    >
      <DialogTitle>Advanced Settings</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Manage settings and actions for:
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 3 }}>
          {video?.file_name}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          • Start or restart transcription.
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          • (Future) Generate B-roll, keywords, or summaries here.
        </Typography>

        {loading ? (
          <div className="flex items-center gap-2">
            <CircularProgress size={20} />
            <Typography variant="body2">{status}</Typography>
          </div>
        ) : (
          status && <Typography variant="body2">{status}</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <MDButton onClick={onClose} color="secondary">
          Close
        </MDButton>
        <MDButton onClick={handleTranscribe} color="info" disabled={loading}>
          {loading ? "Processing..." : "Transcribe"}
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
