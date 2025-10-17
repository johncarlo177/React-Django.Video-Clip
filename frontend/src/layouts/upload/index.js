import React, { useState, useRef } from "react";
import { Box, Button, LinearProgress, Typography, Paper, Link } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axiosInstance from "libs/axios";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [videoLength, setVideoLength] = useState(0);

  const navigate = useNavigate();

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
      return;
    }

    // 0) Check user's video count first
    const count = await getUserVideoCount();
    console.log(count, "count");
    if (count === null) {
      setMessage("Could not validate account limits. Try again later.");
      return;
    }

    // If user already uploaded >= allowed free limit -> show payment
    const FREE_LIMIT = 1; // change if you want another free quota
    if (count >= FREE_LIMIT) {
      setMessage("Payment required for further uploads.");
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

      const filePath = "/Videos/" + file.name;

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
      setMessage("✅ Video uploaded successfully!");
      navigate("/dashboard");

      // 3️⃣ Save info to backend
      await axiosInstance.post("/api/save-upload-info/", {
        file_name: file.name,
        dropbox_path: filePath,
        dropbox_link: downloadLink,
      });

      setFile(null);
    } catch (err) {
      if (err.response?.status === 409) {
        try {
          const token = await getDropboxToken();
          const filePath = "/Videos/" + file.name;
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
            // navigate("/dashboard");
          }
        } catch (subErr) {
          console.error("Error fetching existing link:", subErr);
        }
      } else {
        console.error("Upload error:", err.response?.data || err);
        setMessage("❌ Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
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
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box
        component={Paper}
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          mx: "auto",
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Upload your Video
        </Typography>

        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
          disabled={uploading}
        />

        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          onClick={handleClick}
          disabled={uploading}
          sx={{ mt: 2 }}
        >
          Choose Video
        </Button>

        {/* Show selected file name */}
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected File: {file.name}
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading || !file}
            sx={{ mt: 2 }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Box>

        {uploading && (
          <Box sx={{ width: "100%", mt: 3 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {progress}% completed
            </Typography>
          </Box>
        )}

        {message && (
          <Typography
            variant="body1"
            sx={{ mt: 3 }}
            color={message.startsWith("✅") ? "green" : "red"}
          >
            {message}
          </Typography>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Upload;
