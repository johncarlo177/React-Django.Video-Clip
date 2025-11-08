import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Grid,
  Chip,
  Alert,
  Fade,
  CircularProgress,
} from "@mui/material";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import TranscribeIcon from "@mui/icons-material/RecordVoiceOver";
import SearchIcon from "@mui/icons-material/Search";
import MovieIcon from "@mui/icons-material/Movie";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import axiosInstance from "libs/axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useNavigate } from "react-router-dom";

export default function GetStockClips() {
  const location = useLocation();
  const video = location.state?.video;
  const videoId = video?.id;
  const videoName = video?.file_name;

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

  const handleCancel = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const fetchExistingClips = async () => {
      if (!video || !videoId) return;

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

    fetchExistingClips();
  }, [video, videoId]);

  const handleTranscribe = async () => {
    setClips([]);
    setProcessComplete(false);
    setClipsStatus("");
    setKeywordStatus("");
    setDownloadLink(null); // Reset download link when restarting
    if (!video) return;

    if (!aspectRatio) {
      setRatioError(true);
      return;
    }

    try {
      isCancelled.current = false;
      setLoading(true);
      setStatus("Starting transcription...");

      const startRes = await axiosInstance.post(`/api/transcribe/${videoId}/`);
      const jobId = startRes.data.job?.id;
      if (!jobId) throw new Error("No job ID returned");

      setStatus("Transcription started. Waiting for completion...");

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

  const handleKeywordDetection = async (videoId) => {
    try {
      setKeywordLoading(true);
      setKeywordStatus("🔍 Detecting keywords with AI...");

      const res = await axiosInstance.post(`/api/keyword-detection/${videoId}/`);
      const fetchedKeywords = res.data.keywords || [];

      setKeywords(fetchedKeywords);
      setKeywordStatus(`✅ Keyword detection complete! Found ${fetchedKeywords.length} keywords`);
      handleFetchStockClips(fetchedKeywords, videoId);
    } catch (err) {
      console.error("Keyword detection failed:", err);
      setKeywordStatus("❌ Keyword detection failed");
    } finally {
      setKeywordLoading(false);
    }
  };

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
      setClipsStatus(`✅ Stock clips fetched! (${fetchedClips.length} clips)`);
      setProcessComplete(true);
    } catch (err) {
      console.error("Failed to fetch stock clips:", err);
      setClipsStatus("❌ Failed to fetch stock clips");
    } finally {
      setClipsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!video || clips.length === 0) return;

    try {
      setClipsStatus("📦 Creating ZIP and uploading to Dropbox...");
      setClipsLoading(true);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setSaveProgress(progress);
        if (progress >= 90) clearInterval(interval);
      }, 400);

      const res = await axiosInstance.post(`/api/save-stock-clips/`, {
        video_id: videoId,
        clips,
      });

      clearInterval(interval);
      setSaveProgress(100);

      const link = res.data.dropbox_link;
      setClipsStatus(`✅ ZIP uploaded successfully!`);
      setDownloadLink(link);
    } catch (err) {
      console.error("Save failed:", err);
      setClipsStatus("❌ Failed to upload ZIP");
    } finally {
      setClipsLoading(false);
      setTimeout(() => setSaveProgress(0), 2000);
    }
  };

  const getStepStatus = (step) => {
    if (step === 1) {
      if (loading) return "processing";
      if (status && status.includes("✅")) return "complete";
      if (status && status.includes("❌")) return "error";
      return "pending";
    }
    if (step === 2) {
      if (keywordLoading) return "processing";
      if (keywordStatus && keywordStatus.includes("✅")) return "complete";
      if (keywordStatus && keywordStatus.includes("❌")) return "error";
      if (status && status.includes("✅")) return "ready";
      return "pending";
    }
    if (step === 3) {
      if (clipsLoading) return "processing";
      if (clipsStatus && clipsStatus.includes("✅")) return "complete";
      if (clipsStatus && clipsStatus.includes("❌")) return "error";
      if (keywordStatus && keywordStatus.includes("✅")) return "ready";
      return "pending";
    }
    return "pending";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} mb={4}>
        <MDBox
          sx={{
            maxWidth: "1400px",
            mx: "auto",
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Header Section */}
          <MDBox
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
            p={4}
            mb={4}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <VideoLibraryIcon sx={{ fontSize: 48, color: "white" }} />
              <MDBox>
                <MDTypography variant="h3" fontWeight="bold" color="white" mb={0.5}>
                  Get Stock Clips
                </MDTypography>
                <MDTypography variant="body1" color="white" opacity={0.9}>
                  {videoName || "Video Processing"}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>

          {/* Aspect Ratio Selection */}
          <MDBox
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              bgColor: "white",
              p: 4,
              mb: 4,
            }}
          >
            <MDTypography variant="h5" fontWeight="bold" color="text" mb={3}>
              Select Aspect Ratio
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={3} flexWrap="wrap">
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Aspect Ratio</InputLabel>
                <Select
                  value={aspectRatio}
                  label="Aspect Ratio"
                  onChange={(e) => {
                    setAspectRatio(e.target.value);
                    setRatioError(false);
                  }}
                  sx={{
                    height: "50px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: ratioError ? "error.main" : undefined,
                    },
                  }}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="16:9">16:9 (Widescreen)</MenuItem>
                  <MenuItem value="9:16">9:16 (Vertical)</MenuItem>
                  <MenuItem value="4:3">4:3 (Standard)</MenuItem>
                  <MenuItem value="3:4">3:4 (Portrait)</MenuItem>
                  <MenuItem value="1:1">1:1 (Square)</MenuItem>
                </Select>
              </FormControl>
              {ratioError && (
                <Alert severity="error" sx={{ flex: 1, minWidth: "200px" }}>
                  Please select an aspect ratio before starting.
                </Alert>
              )}
            </MDBox>
          </MDBox>

          {/* Process Steps */}
          <Grid container spacing={3} mb={4}>
            {/* Step 1: Transcription */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <MDBox
                  p={3}
                  sx={{
                    background:
                      getStepStatus(1) === "complete"
                        ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                        : getStepStatus(1) === "processing"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : getStepStatus(1) === "error"
                        ? "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
                        : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    borderRadius: "12px 12px 0 0",
                  }}
                >
                  <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                    <MDBox
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "white",
                        display: "flex",
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      {getStepStatus(1) === "processing" ? (
                        <CircularProgress size={28} />
                      ) : getStepStatus(1) === "complete" ? (
                        <CheckCircleIcon sx={{ fontSize: 32, color: "#11998e" }} />
                      ) : getStepStatus(1) === "error" ? (
                        <ErrorIcon sx={{ fontSize: 32, color: "#eb3349" }} />
                      ) : (
                        <TranscribeIcon sx={{ fontSize: 32, color: "#667eea" }} />
                      )}
                    </MDBox>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold" color="white">
                        Step 1
                      </MDTypography>
                      <MDTypography variant="body2" color="white" opacity={0.9}>
                        Transcription
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
                <MDBox p={3}>
                  {loading ? (
                    <>
                      <LinearProgress
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 2,
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          },
                        }}
                      />
                      <MDTypography variant="body2" color="text" fontWeight="medium">
                        {status || "Processing..."}
                      </MDTypography>
                    </>
                  ) : status ? (
                    <MDTypography
                      variant="body2"
                      color={status.includes("❌") ? "error" : "text"}
                      fontWeight="medium"
                    >
                      {status}
                    </MDTypography>
                  ) : (
                    <MDTypography variant="body2" color="text.secondary">
                      Click Start to begin transcription
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Step 2: Keyword Detection */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <MDBox
                  p={3}
                  sx={{
                    background:
                      getStepStatus(2) === "complete"
                        ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                        : getStepStatus(2) === "processing"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : getStepStatus(2) === "error"
                        ? "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
                        : getStepStatus(2) === "ready"
                        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    borderRadius: "12px 12px 0 0",
                  }}
                >
                  <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                    <MDBox
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "white",
                        display: "flex",
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      {getStepStatus(2) === "processing" ? (
                        <CircularProgress size={28} />
                      ) : getStepStatus(2) === "complete" ? (
                        <CheckCircleIcon sx={{ fontSize: 32, color: "#11998e" }} />
                      ) : getStepStatus(2) === "error" ? (
                        <ErrorIcon sx={{ fontSize: 32, color: "#eb3349" }} />
                      ) : (
                        <SearchIcon sx={{ fontSize: 32, color: "#667eea" }} />
                      )}
                    </MDBox>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold" color="white">
                        Step 2
                      </MDTypography>
                      <MDTypography variant="body2" color="white" opacity={0.9}>
                        Keyword Detection
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
                <MDBox p={3}>
                  {keywordLoading ? (
                    <>
                      <LinearProgress
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 2,
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          },
                        }}
                      />
                      <MDTypography variant="body2" color="text" fontWeight="medium">
                        {keywordStatus || "Detecting keywords..."}
                      </MDTypography>
                    </>
                  ) : keywordStatus ? (
                    <MDBox>
                      <MDTypography
                        variant="body2"
                        color={keywordStatus.includes("❌") ? "error" : "text"}
                        fontWeight="medium"
                        mb={1}
                      >
                        {keywordStatus}
                      </MDTypography>
                      {keywords.length > 0 && (
                        <MDBox display="flex" flexWrap="wrap" gap={1} mt={2}>
                          {keywords.slice(0, 5).map((keyword, idx) => (
                            <Chip
                              key={idx}
                              label={keyword}
                              size="small"
                              sx={{
                                bgcolor: "info.main",
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                          ))}
                          {keywords.length > 5 && (
                            <Chip
                              label={`+${keywords.length - 5} more`}
                              size="small"
                              sx={{
                                bgcolor: "grey.300",
                                color: "text",
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </MDBox>
                      )}
                    </MDBox>
                  ) : (
                    <MDTypography variant="body2" color="text.secondary">
                      Waiting for transcription to complete
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Step 3: Get Stock Clips */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <MDBox
                  p={3}
                  sx={{
                    background:
                      getStepStatus(3) === "complete"
                        ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                        : getStepStatus(3) === "processing"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : getStepStatus(3) === "error"
                        ? "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
                        : getStepStatus(3) === "ready"
                        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    borderRadius: "12px 12px 0 0",
                  }}
                >
                  <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                    <MDBox
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "white",
                        display: "flex",
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      {getStepStatus(3) === "processing" ? (
                        <CircularProgress size={28} />
                      ) : getStepStatus(3) === "complete" ? (
                        <CheckCircleIcon sx={{ fontSize: 32, color: "#11998e" }} />
                      ) : getStepStatus(3) === "error" ? (
                        <ErrorIcon sx={{ fontSize: 32, color: "#eb3349" }} />
                      ) : (
                        <MovieIcon sx={{ fontSize: 32, color: "#667eea" }} />
                      )}
                    </MDBox>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold" color="white">
                        Step 3
                      </MDTypography>
                      <MDTypography variant="body2" color="white" opacity={0.9}>
                        Get Stock Clips
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </MDBox>
                <MDBox p={3}>
                  {clipsLoading ? (
                    <>
                      <LinearProgress
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 2,
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          },
                        }}
                      />
                      <MDTypography variant="body2" color="text" fontWeight="medium">
                        {clipsStatus || "Fetching clips..."}
                      </MDTypography>
                    </>
                  ) : clipsStatus ? (
                    <MDTypography
                      variant="body2"
                      color={clipsStatus.includes("❌") ? "error" : "text"}
                      fontWeight="medium"
                    >
                      {clipsStatus}
                    </MDTypography>
                  ) : (
                    <MDTypography variant="body2" color="text.secondary">
                      Waiting for keyword detection
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>

          {/* Stock Clips Grid */}
          {clips.length > 0 && (
            <Fade in={clips.length > 0}>
              <MDBox
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  bgColor: "white",
                  p: 4,
                  mb: 4,
                }}
              >
                <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <MDTypography variant="h5" fontWeight="bold" color="text">
                    Stock Clips ({clips.length})
                  </MDTypography>
                </MDBox>
                <Grid container spacing={3}>
                  {clips.map((clip, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={clip.id || index}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        <MDBox
                          sx={{
                            position: "relative",
                            width: "100%",
                            paddingTop: "56.25%",
                            backgroundColor: "grey.200",
                            overflow: "hidden",
                          }}
                        >
                          <video
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            src={clip.video_files?.[0]}
                            controls
                            preload="metadata"
                          />
                        </MDBox>
                        <MDBox p={2}>
                          <Chip
                            label={clip.keyword || "Unknown"}
                            size="small"
                            sx={{
                              bgcolor: "info.main",
                              color: "white",
                              fontWeight: 600,
                              width: "100%",
                            }}
                          />
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
            </Fade>
          )}

          {/* Save Progress */}
          {saveProgress > 0 && (
            <Fade in={saveProgress > 0}>
              <MDBox
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  bgColor: "white",
                  p: 3,
                  mb: 4,
                }}
              >
                <MDBox display="flex" justifyContent="space-between" mb={1}>
                  <MDTypography variant="body2" fontWeight="medium" color="text">
                    Uploading ZIP...
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="medium" color="text">
                    {saveProgress}%
                  </MDTypography>
                </MDBox>
                <LinearProgress
                  variant="determinate"
                  value={saveProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                    },
                  }}
                />
              </MDBox>
            </Fade>
          )}

          {/* Action Buttons */}
          <MDBox
            display="flex"
            gap={2}
            flexWrap="wrap"
            justifyContent="center"
            sx={{
              position: "sticky",
              bottom: 20,
              zIndex: 10,
            }}
          >
            <MDButton
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              sx={{
                px: 4,
                py: 1.5,
                minWidth: "120px",
              }}
            >
              Cancel
            </MDButton>
            {processComplete ? (
              <>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={handleTranscribe}
                  disabled={loading || keywordLoading || clipsLoading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    minWidth: "120px",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  }}
                >
                  {loading || keywordLoading || clipsLoading ? (
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Processing...</span>
                    </MDBox>
                  ) : (
                    "Restart"
                  )}
                </MDButton>
                {downloadLink ? (
                  <MDButton
                    variant="gradient"
                    color="success"
                    component="a"
                    href={downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<CloudDownloadIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      minWidth: "120px",
                      boxShadow: "0 4px 12px rgba(46, 125, 50, 0.4)",
                    }}
                  >
                    Download ZIP
                  </MDButton>
                ) : (
                  <MDButton
                    variant="gradient"
                    color="success"
                    onClick={handleSave}
                    disabled={clipsLoading || clips.length === 0}
                    startIcon={!clipsLoading && <CloudDownloadIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      minWidth: "120px",
                      boxShadow: "0 4px 12px rgba(46, 125, 50, 0.4)",
                    }}
                  >
                    {clipsLoading ? (
                      <MDBox display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Saving...</span>
                      </MDBox>
                    ) : (
                      "Save & Download"
                    )}
                  </MDButton>
                )}
              </>
            ) : (
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleTranscribe}
                disabled={loading || keywordLoading || clipsLoading}
                sx={{
                  px: 4,
                  py: 1.5,
                  minWidth: "120px",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                }}
              >
                {loading || keywordLoading || clipsLoading ? (
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Processing...</span>
                  </MDBox>
                ) : (
                  "Start Process"
                )}
              </MDButton>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}
