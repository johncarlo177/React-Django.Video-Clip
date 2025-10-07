import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Avatar,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import MDButton from "components/MDButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axiosInstance from "libs/axios";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";

// import VideoThumbnail from "./VideoThumbnail";

function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  // Fetch video list
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/api/video-lists/");
        setVideos(res.data);
        console.log(res.data, "result");
      } catch (err) {
        console.error("Failed to fetch videos:", err);
      }
    };
    fetchVideos();
  }, []);

  const getDropboxLink = (url, type = "download") => {
    if (!url) return "";
    if (url.includes("?dl=0") || url.includes("?dl=1")) {
      return url.replace(/\?dl=\d/, type === "download" ? "?dl=1" : "?dl=0");
    }
    return url + (type === "download" ? "?dl=1" : "?dl=0");
  };

  const handleDownload = (link) => {
    window.open(link, "_blank");
  };

  const handleWatch = (link) => {
    const previewLink = getDropboxLink(link, "preview");
    window.open(previewLink, "_blank");
  };

  const handleTranscribe = async (videoId) => {
    try {
      // Step 1: Start transcription
      const startRes = await axiosInstance.post(`/api/transcribe/${videoId}/`);
      console.log("Transcription started:", startRes.data);

      const jobId = startRes.data.job?.id;
      if (!jobId) {
        console.error("No job ID returned!");
        return;
      }

      console.log("🟡 Job ID:", jobId);

      // Step 2: Define polling function
      const pollTranscription = async (attempt = 0) => {
        try {
          const statusRes = await axiosInstance.get(`/api/transcribe/status/${jobId}/`);
          const data = statusRes.data;
          console.log(`⏳ Attempt ${attempt + 1}: Job state = ${data.state}`);

          if (data.state === "automatic_done") {
            console.log("Transcript:", data.transcript);
          } else if (data.state === "error" || data.state === "failed") {
            console.error("Transcription failed:", data);
          } else {
            setTimeout(() => pollTranscription(attempt + 1), 10000);
          }
        } catch (err) {
          console.error("Error checking status:", err);
          alert("Failed to check transcription status.");
        }
      };

      // Step 3: Start polling
      pollTranscription();
    } catch (err) {
      console.error("Error starting transcription:", err);
      alert("Failed to start transcription.");
    }
  };

  const handleOpenDeleteModal = (videoId) => {
    setVideoToDelete(videoId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setVideoToDelete(null);
    setOpenDeleteModal(false);
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      const res = await axiosInstance.delete(`/api/video-delete/${videoId}/`);
      console.log(res.data);
      alert("Video deleted successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete video:", err.response || err);
      alert("Failed to delete video.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Uploaded Videos
        </Typography>
        <TableContainer>
          <Table>
            <TableBody>
              {videos.length > 0 ? (
                videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleWatch(video.dropbox_link)}
                      >
                        <PlayArrowIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>{video.file_name}</TableCell>
                    <TableCell>{new Date(video.uploaded_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDownload(video.dropbox_link)}>
                        <CloudDownloadIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton color="dark" onClick={() => handleOpenDeleteModal(video.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton color="dark" onClick={() => handleTranscribe(video.id)}>
                        <SettingsIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No videos uploaded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this video? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseDeleteModal} color="secondary">
            Cancel
          </MDButton>
          <MDButton
            onClick={async () => {
              await handleDeleteVideo(videoToDelete);
              handleCloseDeleteModal();
            }}
            color="error"
          >
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Dashboard;
