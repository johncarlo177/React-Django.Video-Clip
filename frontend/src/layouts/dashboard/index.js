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
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axiosInstance from "libs/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteVideo from "./components/DeleteVideo";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const navigate = useNavigate();

  // Fetch video list
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/api/video-lists/");
        const videoList = res.data;

        // 🔍 For each video, check if clips ZIP exists
        const updatedVideos = await Promise.all(
          videoList.map(async (video) => {
            try {
              const clipsRes = await axiosInstance.get(`/api/clip-lists/`, {
                params: { video_id: video.id },
              });
              const zipLink = clipsRes.data.dropbox_link || null;
              return { ...video, zip_link: zipLink };
            } catch {
              return { ...video, zip_link: null };
            }
          })
        );

        setVideos(updatedVideos);
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

  const handleGetStockClips = (video) => {
    navigate(`/dashboard/get-stock-clips?id=${video.id}`, {
      state: { video: video },
    });
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
                        title="Play Video"
                      >
                        <PlayArrowIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>{video.file_name}</TableCell>
                    <TableCell>{new Date(video.uploaded_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton
                        color="dark"
                        onClick={() => handleDownload(video.dropbox_link)}
                        title="Download Uploaded Video"
                      >
                        <CloudDownloadIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="dark"
                        onClick={() => handleOpenDeleteModal(video.id)}
                        title="Delete Video"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="dark"
                        onClick={() => handleGetStockClips(video)}
                        title="Get Stock Clips"
                      >
                        <SettingsIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      {video.zip_link && (
                        <IconButton
                          color="dark"
                          onClick={() => handleDownload(video.zip_link)}
                          title="Download Stock Clips ZIP"
                        >
                          <FileDownloadIcon />
                        </IconButton>
                      )}
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
    </DashboardLayout>
  );
}

export default Dashboard;
