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
      // If link already exists (409 conflict), fetch existing one
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

        {/* {downloadUrl && (
          <Box sx={{ mt: 3, fontSize: 10, textAlign: "left" }}>
            <Typography variant="body1">Download Link:</Typography>
            <Link
              href={downloadUrl}
              target="_blank"
              rel="noopener"
              sx={{ overflowWrap: "break-word", color: "blue" }}
            >
              {downloadUrl}
            </Link>
          </Box>
        )} */}
      </Box>
      {/* <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          mt: 3,
          cursor: "pointer",
          justifyContent: "center",
          "&:hover": { color: "primary.main" },
        }}
        onClick={() => navigate("/dashboard")}
      >
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          Please go to Dashboard and handle your videos
        </Typography>
        <ArrowForwardIcon />
      </Box> */}
    </DashboardLayout>
  );
}

export default Upload;
