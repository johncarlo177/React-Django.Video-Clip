import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  LinearProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MDButton from "components/MDButton";
import axiosInstance from "libs/axios";

export default function AdvancedSettings({ open, onClose, video }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const isCancelled = useRef(false);

  const [keywords, setKeywords] = useState([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordStatus, setKeywordStatus] = useState("");
  const [clips, setClips] = useState([]);
  const [clipsLoading, setClipsLoading] = useState(false);
  const [clipsStatus, setClipsStatus] = useState("");
  const [processComplete, setProcessComplete] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("");
  const [ratioError, setRatioError] = useState(false);

  // ✅ Stop polling and reset when dialog closes
  const handleClose = () => {
    isCancelled.current = true;
    setLoading(false);
    setStatus("");
    setKeywords([]);
    setKeywordLoading(false);
    setKeywordStatus("");
    onClose();
  };

  useEffect(() => {
    const fetchExistingClips = async () => {
      if (!video) return;

      try {
        const res = await axiosInstance.get(`/api/clip-lists/`, {
          params: { video_id: video.id },
        });
        const fetchedClips = res.data.clips || [];

        if (fetchedClips.length > 0) {
          setClips(fetchedClips);
          setProcessComplete(true);
          setClipsStatus(`✅ Loaded existing stock clips (${fetchedClips.length})`);
        } else {
          setClips([]);
          setClipsStatus("");
          setProcessComplete(false);
        }
      } catch (err) {
        console.error("Failed to fetch existing clips:", err);
        setClips([]);
        setClipsStatus("❌ Failed to load existing clips");
      }
    };

    if (open) {
      fetchExistingClips();
    } else {
      // Reset state when modal closes
      setClips([]);
      setClipsStatus("");
      setProcessComplete(false);
    }
  }, [open, video]);

  const handleTranscribe = async () => {
    if (!video) return;

    if (!aspectRatio) {
      setRatioError(true);
      return;
    }

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
            setLoading(false);
            await handleKeywordDetection(video.id);
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

  // Keyword detection step with progress display
  const handleKeywordDetection = async (videoId) => {
    try {
      setKeywordLoading(true);
      setKeywordStatus("🔍 Detecting keywords with AI...");

      const res = await axiosInstance.post(`/api/keyword-detection/${videoId}/`);
      const fetchedKeywords = res.data.keywords || [];

      setKeywords(fetchedKeywords);
      setKeywordStatus(`✅ Keyword detection complete!`);
      handleFetchStockClips(fetchedKeywords, videoId);
    } catch (err) {
      console.error("Keyword detection failed:", err);
      setKeywordStatus("❌ Keyword detection failed");
    } finally {
      setKeywordLoading(false);
    }
  };

  // Get stock clips
  const handleFetchStockClips = async (keywords, videoId) => {
    if (!keywords || keywords.length === 0) return;

    try {
      setClipsLoading(true);
      setClipsStatus("🎬 Fetching stock clips from Pexels...");

      const res = await axiosInstance.post(`/api/fetch-stock-clips/`, {
        keywords,
        videoId,
        aspect_ratio: aspectRatio,
      });
      const fetchedClips = res.data.clips || [];

      setClips(fetchedClips);
      setClipsStatus(`✅ Stock clips fetched! (${fetchedClips.length})`);
      setProcessComplete(true); // All done — enable Save button
    } catch (err) {
      console.error("Failed to fetch stock clips:", err);
      setClipsStatus("❌ Failed to fetch stock clips");
    } finally {
      setClipsLoading(false);
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
        <Typography variant="h2" sx={{ mb: 2, fontWeight: "bold" }}>
          Get Your Video Stock Clips
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          {video?.file_name}
        </Typography>

        {/* Aspect Ratio */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 5, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>Select Aspect Ratio</Typography>
          <FormControl>
            <InputLabel>Aspect Ratio</InputLabel>
            <Select
              value={aspectRatio}
              label="Aspect Ratio"
              onChange={(e) => {
                setAspectRatio(e.target.value);
                setRatioError(false);
              }}
              sx={{ width: "200px", height: "40px" }}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="16:9">16:9</MenuItem>
              <MenuItem value="9:16">9:16 </MenuItem>
              <MenuItem value="4:3">4:3</MenuItem>
              <MenuItem value="3:4">3:4</MenuItem>
              <MenuItem value="1:1">1:1</MenuItem>
            </Select>
          </FormControl>
          {ratioError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              Please select an aspect ratio before starting.
            </Typography>
          )}
        </Box>

        {/* 1. Transcription Section */}
        <Typography sx={{ fontWeight: "bold" }}>1. Transcription</Typography>
        <Box sx={{ mb: 3 }}>
          {loading && (
            <>
              <LinearProgress sx={{ width: "100%", mt: 1, overflowX: "hidden" }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {status}
              </Typography>
            </>
          )}
          {!loading && status && <Typography variant="body2">{status}</Typography>}
        </Box>

        {/* 2. Keyword Detection Section */}
        <Typography sx={{ fontWeight: "bold" }}>2. Keyword Detection</Typography>
        <Box sx={{ mb: 3 }}>
          {keywordLoading && (
            <>
              <LinearProgress sx={{ width: "100%", mt: 1, overflowX: "hidden" }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {keywordStatus}
              </Typography>
            </>
          )}
          {!keywordLoading && keywordStatus && (
            <Typography variant="body2">{keywordStatus}</Typography>
          )}
        </Box>

        {/* 3. Clip Video Section */}
        <Typography sx={{ fontWeight: "bold" }}>3. Get Stock Clips</Typography>
        {(clipsLoading || clipsStatus || clips.length > 0) && (
          <Box sx={{ mb: 3 }}>
            {clipsLoading && (
              <>
                <LinearProgress sx={{ width: "100%", mt: 1, overflowX: "hidden" }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {clipsStatus || ""}
                </Typography>
              </>
            )}
            {!clipsLoading && clipsStatus && <Typography variant="body2">{clipsStatus}</Typography>}
            {!clipsLoading && clips.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                {clips.map((clip) => (
                  <Box key={clip.id} sx={{ width: 200 }}>
                    <video width="100%" src={clip.video_files[0]} controls />
                    <Typography variant="caption">{clip.keyword}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <MDButton onClick={handleClose} color="secondary">
          Close
        </MDButton>
        {processComplete ? (
          <>
            <MDButton onClick={handleTranscribe} color="info" disabled={loading || keywordLoading}>
              {loading || keywordLoading ? "Processing..." : "Restart"}
            </MDButton>
            <MDButton color="success" onClick={() => console.log("Save clicked!")}>
              Save
            </MDButton>
          </>
        ) : (
          <MDButton onClick={handleTranscribe} color="info" disabled={loading || keywordLoading}>
            {loading || keywordLoading ? "Processing..." : "Start"}
          </MDButton>
        )}
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
