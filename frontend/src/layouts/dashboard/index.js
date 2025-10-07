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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axiosInstance from "libs/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteVideo from "./components/DeleteVideo";
import AdvancedSettings from "./components/AdvancedSetting";

function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

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

  const handleOpenDeleteModal = (videoId) => {
    setVideoToDelete(videoId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setVideoToDelete(null);
    setOpenDeleteModal(false);
  };

  const handleOpenSettingsModal = (video) => {
    setSelectedVideo(video);
    setOpenSettingsModal(true);
  };

  const handleCloseSettingsModal = () => {
    setSelectedVideo(null);
    setOpenSettingsModal(false);
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
                      <IconButton color="dark" onClick={() => handleOpenSettingsModal(video)}>
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
      <DeleteVideo
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        videoId={videoToDelete}
      />
      <AdvancedSettings
        open={openSettingsModal}
        onClose={handleCloseSettingsModal}
        video={selectedVideo}
      />
    </DashboardLayout>
  );
}

export default Dashboard;
