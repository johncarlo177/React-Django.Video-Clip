import React, { useState } from "react";
import { Box, Button, LinearProgress, Typography, Paper, Link } from "@mui/material";
import { useRef } from "react";
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

  const getDropboxToken = async () => {
    try {
      const response = await axiosInstance.get("/api/dropbox-token/");
      return response.data.access_token;
    } catch (err) {
      console.error("Error getting token:", err);
      setMessage("Failed to get Dropbox token");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a video file first");
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

      // Upload
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

      setMessage("✅ Video uploaded successfully!");

      // Get download link
      const linkRes = await axios.post(
        "https://api.dropboxapi.com/2/files/get_temporary_link",
        { path: filePath },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setDownloadUrl(linkRes.data.link);
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err);
      setMessage("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current.click();
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
          Upload Video to Dropbox
        </Typography>

        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files.length > 0) {
              setFile(e.target.files[0]);
            }
          }}
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

        {downloadUrl && (
          <Box sx={{ mt: 3, fontSize: 10 }}>
            <Typography variant="body1">Download Link:</Typography>
            <Link
              href={downloadUrl}
              target="_blank"
              rel="noopener"
              sx={{ overflowWrap: "break-word" }}
            >
              {downloadUrl}
            </Link>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Upload;
