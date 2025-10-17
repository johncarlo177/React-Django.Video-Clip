import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Typography,
  LinearProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import MDButton from "components/MDButton";
import axiosInstance from "libs/axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useNavigate } from "react-router-dom";

export default function GetStockClips() {
  const location = useLocation();
  const video = location.state?.video;
  const videoId = video.id;
  const videoName = video.file_name;

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
  const [saveProgress, setSaveProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState(null);

  const navigate = useNavigate();
  // ✅ Stop polling and reset when dialog closes
  const handleCancel = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const fetchExistingClips = async () => {
      if (!video) return;

      try {
        const res = await axiosInstance.get(`/api/clip-lists/`, {
          params: { video_id: videoId },
        });

        const fetchedClips = res.data.clips || [];
        const zipLink = res.data.dropbox_link || null;

        if (fetchedClips.length > 0) {
          setClips(fetchedClips);
          setProcessComplete(true);
          setClipsStatus(`✅ Loaded existing stock clips (${fetchedClips.length})`);
        } else {
          setClips([]);
          setProcessComplete(false);
          setClipsStatus("");
        }

        // ✅ If ZIP link exists, show Download button
        if (zipLink) {
          setDownloadLink(zipLink);
          setClipsStatus((prev) => prev + " 📦 ZIP available for download.");
        } else {
          setDownloadLink(null);
        }
      } catch (err) {
        console.error("Failed to fetch existing clips:", err);
        setClips([]);
        setProcessComplete(false);
        setClipsStatus("❌ Failed to load existing clips");
        setDownloadLink(null);
      }
    };

    if (open) {
      fetchExistingClips();
    } else {
      // Reset state when modal closes
      setClips([]);
      setProcessComplete(false);
      setClipsStatus("");
      setDownloadLink(null);
    }
  }, [open, video]);

  const handleTranscribe = async () => {
    setClips([]);
    setProcessComplete(false);
    setClipsStatus("");
    setKeywordStatus("");
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
      const startRes = await axiosInstance.post(`/api/transcribe/${videoId}/`);
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
            await handleKeywordDetection(videoId);
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

  // handle zip save
  const handleSave = async () => {
    if (!video || clips.length === 0) return;

    try {
      setClipsStatus("📦 Creating ZIP and uploading to Dropbox...");
      setClipsLoading(true);

      // Simulate progress bar updates
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setSaveProgress(progress);
        if (progress >= 90) clearInterval(interval); // stop before 100% until server responds
      }, 400);

      const res = await axiosInstance.post(`/api/save-stock-clips/`, {
        video_id: videoId,
        clips,
      });

      clearInterval(interval);
      setSaveProgress(100);

      const link = res.data.dropbox_link;
      setClipsStatus(`✅ ZIP uploaded!`);
      setDownloadLink(link);
    } catch (err) {
      console.error("Save failed:", err);
      setClipsStatus("❌ Failed to upload ZIP");
    } finally {
      setClipsLoading(false);
      setTimeout(() => setSaveProgress(0), 2000);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box
        sx={{
          p: 4,
          maxWidth: "1200px",
          mx: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            Get Your Video Stock Clips
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {videoName}
          </Typography>
        </Box>

        {/* Aspect Ratio */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}>
            Select Aspect Ratio
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3 }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Aspect Ratio</InputLabel>
              <Select
                value={aspectRatio}
                label="Aspect Ratio"
                onChange={(e) => {
                  setAspectRatio(e.target.value);
                  setRatioError(false);
                }}
                sx={{ height: "40px" }}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="16:9">16:9</MenuItem>
                <MenuItem value="9:16">9:16</MenuItem>
                <MenuItem value="4:3">4:3</MenuItem>
                <MenuItem value="3:4">3:4</MenuItem>
                <MenuItem value="1:1">1:1</MenuItem>
              </Select>
            </FormControl>
            {ratioError && (
              <Typography color="error" variant="body2">
                Please select an aspect ratio before starting.
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Transcription */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "secondary.main" }}>
            1️⃣ Transcription
          </Typography>
          {loading ? (
            <>
              <LinearProgress sx={{ width: "100%", mb: 1, overflow: "hidden" }} />
              <Typography variant="body2">{status}</Typography>
            </>
          ) : (
            status && <Typography variant="body2">{status}</Typography>
          )}
        </Paper>

        {/* Keyword Detection */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "secondary.main" }}>
            2️⃣ Keyword Detection
          </Typography>
          {keywordLoading ? (
            <>
              <LinearProgress sx={{ width: "100%", mb: 1, overflow: "hidden" }} />
              <Typography variant="body2">{keywordStatus}</Typography>
            </>
          ) : (
            keywordStatus && <Typography variant="body2">{keywordStatus}</Typography>
          )}
        </Paper>

        {/* Stock Clips */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "secondary.main" }}>
            3️⃣ Get Stock Clips
          </Typography>

          {(clipsLoading || clipsStatus || clips.length > 0) && (
            <Box>
              {clips.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 2,
                    mt: 2,
                    mb: 2,
                  }}
                >
                  {clips.map((clip) => (
                    <Paper
                      key={clip.id}
                      sx={{ p: 1, borderRadius: 2, boxShadow: 1, textAlign: "center" }}
                    >
                      <video width="100%" src={clip.video_files[0]} controls />
                      <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                        {clip.keyword}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
              {clipsLoading && (
                <>
                  <LinearProgress sx={{ width: "100%", mb: 1, overflow: "hidden" }} />
                  <Typography variant="body2">{clipsStatus || ""}</Typography>
                </>
              )}
              {!clipsLoading && clipsStatus && (
                <Typography variant="body2">{clipsStatus}</Typography>
              )}

              {downloadLink && (
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <MDButton
                    color="success"
                    component="a"
                    href={downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download ZIP
                  </MDButton>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", mt: 2 }}>
          <MDButton onClick={handleCancel} color="secondary">
            Cancel
          </MDButton>
          {processComplete ? (
            <>
              <MDButton
                onClick={handleTranscribe}
                color="info"
                disabled={loading || keywordLoading}
              >
                {loading || keywordLoading ? "Processing..." : "Restart"}
              </MDButton>
              <MDButton color="success" onClick={handleSave}>
                Save
              </MDButton>
            </>
          ) : (
            <MDButton onClick={handleTranscribe} color="info" disabled={loading || keywordLoading}>
              {loading || keywordLoading ? "Processing..." : "Start"}
            </MDButton>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
