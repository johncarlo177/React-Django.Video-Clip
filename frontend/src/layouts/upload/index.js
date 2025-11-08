import React, { useState, useRef } from "react";
import { LinearProgress, Fade, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import axiosInstance from "libs/axios";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [videoLength, setVideoLength] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileSize, setFileSize] = useState(0);

  const navigate = useNavigate();

  // Decode JWT token to get user info
  const getUserInfo = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return { username: "", userId: "" };

      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const base64Url = token.split(".")[1];
      if (!base64Url) return { username: "", userId: "" };

      // Replace URL-safe characters and decode
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);
      return {
        username: decoded.username || decoded.name || "",
        userId: decoded.user_id || decoded.userId || decoded.id || "",
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return { username: "", userId: "" };
    }
  };

  const getDropboxToken = async () => {
    try {
      const response = await axiosInstance.get("/api/dropbox-token/");
      return response.data.access_token;
    } catch (err) {
      console.error("Error getting token:", err);
      setMessage("Failed to get Dropbox token");
    }
  };

  const getDropboxDownloadLink = (url) => {
    if (!url) return "";
    // If URL already has ?dl=0 or ?dl=1
    if (url.includes("?dl=0") || url.includes("?dl=1")) {
      return url.replace(/\?dl=\d/, "?dl=1");
    }

    // If no query string exists
    if (!url.includes("?")) {
      return url + "?dl=1";
    }

    // If other query params exist
    return url + "&dl=1";
  };

  // get video count
  const getUserVideoCount = async () => {
    try {
      const res = await axiosInstance.get("/api/videos/count/");
      return res.data.count ?? 0;
    } catch (err) {
      console.error("Error getting video count:", err);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a video file first");
      setMessageType("error");
      return;
    }

    // 0) Check user's video count first
    const count = await getUserVideoCount();
    console.log(count, "count");
    if (count === null) {
      setMessage("Could not validate account limits. Try again later.");
      setMessageType("error");
      return;
    }

    // If user already uploaded >= allowed free limit -> show payment
    const FREE_LIMIT = 1; // change if you want another free quota
    if (count >= FREE_LIMIT) {
      setMessage("Payment required for further uploads.");
      setMessageType("error");
      navigate("/subscription", { state: { videoLength } });
      return;
    }

    setUploading(true);
    setMessage("");
    setProgress(0);
    setDownloadUrl("");

    try {
      const token = await getDropboxToken();
      if (!token) return;

      // Get user info from JWT token
      const userInfo = getUserInfo();
      const username = userInfo.username || "User";
      const userId = userInfo.userId || "";

      // Create filename: username.userId-file.name
      const fileName = `${username}.${userId}-${file.name}`;
      const filePath = "/Videos/" + fileName;

      const dropboxArgs = {
        path: filePath,
        mode: "add",
        autorename: true,
        mute: false,
      };

      // 1️⃣ Upload file to Dropbox
      await axios.post("https://content.dropboxapi.com/2/files/upload", file, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Dropbox-API-Arg": JSON.stringify(dropboxArgs),
          "Content-Type": "application/octet-stream",
        },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          }
        },
      });

      // 2️⃣ Create permanent shared link
      const sharedRes = await axios.post(
        "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
        { path: filePath },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let sharedLink = sharedRes.data.url;
      const downloadLink = getDropboxDownloadLink(sharedLink);

      setDownloadUrl(downloadLink);
      setMessage("Video uploaded successfully!");
      setMessageType("success");

      // 3️⃣ Save info to backend
      await axiosInstance.post("/api/save-upload-info/", {
        file_name: fileName, // Use the new filename format
        dropbox_path: filePath,
        dropbox_link: downloadLink,
      });

      setFile(null);
      setFileSize(0);
      setVideoLength(0);
      // Clear the file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        try {
          const token = await getDropboxToken();

          // Get user info from JWT token
          const userInfo = getUserInfo();
          const username = userInfo.username || "User";
          const userId = userInfo.userId || "";

          // Create filename: username.userId-file.name
          const fileName = `${username}.${userId}-${file.name}`;
          const filePath = "/Videos/" + fileName;
          const res = await axios.post(
            "https://api.dropboxapi.com/2/sharing/list_shared_links",
            { path: filePath },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (res.data.links?.length > 0) {
            const existingLink = getDropboxDownloadLink(res.data.links[0].url);
            console.log(existingLink, "existing Link");
            setDownloadUrl(existingLink);
            setMessage("Video already shared — using existing link!");
            setMessageType("success");
            // navigate("/dashboard");
          }
        } catch (subErr) {
          console.error("Error fetching existing link:", subErr);
        }
      } else {
        console.error("Upload error:", err.response?.data || err);
        setMessage("Upload failed. Please try again.");
        setMessageType("error");
      }
    } finally {
      setUploading(false);
    }
  };

  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration; // seconds
      const minutes = Math.ceil(duration / 60); // round up
      setVideoLength(minutes);
    };

    video.src = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setFileSize(selectedFile.size);
    setMessage("");
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      handleFileSelect(droppedFile);
    } else {
      setMessage("Please drop a valid video file");
      setMessageType("error");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setFileSize(0);
    setVideoLength(0);
    setMessage("");
    // Clear the file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox
        sx={{
          maxWidth: "900px",
          mx: "auto",
          mt: 4,
          mb: 4,
        }}
      >
        <MDBox
          sx={{
            overflow: "visible",
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            bgColor: "white",
          }}
        >
          {/* Header with Gradient */}
          <MDBox
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
            p={3}
            textAlign="center"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <MDTypography variant="h4" fontWeight="bold" color="white" mb={1}>
              Upload Your Video
            </MDTypography>
            <MDTypography variant="body2" color="white" opacity={0.9}>
              Select a video file or drag and drop it here
            </MDTypography>
          </MDBox>

          <MDBox p={4}>
            <input
              type="file"
              accept="video/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileInputChange}
              disabled={uploading}
            />

            {/* Drag and Drop Area */}
            <MDBox
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
              sx={{
                border: `3px dashed ${isDragging ? "#667eea" : "#e0e0e0"}`,
                borderRadius: 3,
                p: 6,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backgroundColor: isDragging ? "rgba(102, 126, 234, 0.05)" : "transparent",
                "&:hover": {
                  borderColor: "#667eea",
                  backgroundColor: "rgba(102, 126, 234, 0.05)",
                },
              }}
            >
              {!file ? (
                <>
                  <CloudUploadIcon
                    sx={{
                      fontSize: 64,
                      color: isDragging ? "#667eea" : "#bdbdbd",
                      mb: 2,
                      transition: "all 0.3s ease",
                    }}
                  />
                  <MDTypography variant="h6" fontWeight="medium" color="text" mb={1}>
                    {isDragging ? "Drop your video here" : "Click to browse or drag and drop"}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    Supported formats: MP4, AVI, MOV, WMV, FLV
                  </MDTypography>
                </>
              ) : (
                <Fade in={!!file}>
                  <MDBox>
                    <VideoFileIcon
                      sx={{
                        fontSize: 64,
                        color: "#667eea",
                        mb: 2,
                      }}
                    />
                    <MDTypography variant="h6" fontWeight="medium" color="text" mb={1}>
                      {file.name}
                    </MDTypography>
                    <MDBox display="flex" justifyContent="center" gap={2} flexWrap="wrap" mt={2}>
                      <MDTypography variant="body2" color="text" opacity={0.7}>
                        Size: {formatFileSize(fileSize)}
                      </MDTypography>
                      {videoLength > 0 && (
                        <MDTypography variant="body2" color="text" opacity={0.7}>
                          Duration: ~{videoLength} min
                        </MDTypography>
                      )}
                    </MDBox>
                    <MDButton
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveFile}
                      sx={{ mt: 2 }}
                    >
                      Remove File
                    </MDButton>
                  </MDBox>
                </Fade>
              )}
            </MDBox>

            {/* Upload Button */}
            <MDBox mt={4} textAlign="center">
              <MDButton
                variant="gradient"
                color="info"
                size="large"
                onClick={handleUpload}
                disabled={uploading || !file}
                startIcon={uploading ? null : <CloudUploadIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.5)",
                  },
                  "&:disabled": {
                    boxShadow: "none",
                  },
                }}
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </MDButton>
            </MDBox>

            {/* Progress Bar */}
            {uploading && (
              <Fade in={uploading}>
                <MDBox mt={4}>
                  <MDBox display="flex" justifyContent="space-between" mb={1}>
                    <MDTypography variant="body2" color="text" fontWeight="medium">
                      Uploading...
                    </MDTypography>
                    <MDTypography variant="body2" color="text" fontWeight="medium">
                      {progress}%
                    </MDTypography>
                  </MDBox>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
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

            {/* Message Alert */}
            {message && (
              <Fade in={!!message}>
                <MDBox mt={3}>
                  <Alert
                    icon={
                      messageType === "success" ? (
                        <CheckCircleIcon fontSize="inherit" />
                      ) : (
                        <ErrorIcon fontSize="inherit" />
                      )
                    }
                    severity={messageType}
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
                </MDBox>
              </Fade>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Upload;
