import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
  Card,
  Grid,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} mb={4}>
        {/* Header Section */}
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          p={3}
          mb={4}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <MDBox display="flex" alignItems="center" gap={2}>
            <VideoLibraryIcon sx={{ fontSize: 40, color: "white" }} />
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="white" mb={0.5}>
                My Videos
              </MDTypography>
              <MDTypography variant="body2" color="white" opacity={0.9}>
                Manage and process your uploaded videos
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Videos Section - Responsive */}
        {videos.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <MDBox
              sx={{
                display: { xs: "none", md: "block" },
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                bgColor: "white",
                overflow: "hidden",
              }}
            >
              <TableContainer>
                <Table>
                  <TableBody>
                    {videos.map((video, index) => (
                      <TableRow
                        key={video.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(102, 126, 234, 0.05)",
                          },
                          transition: "background-color 0.2s ease",
                          borderBottom:
                            index < videos.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                        }}
                      >
                        <TableCell align="center">
                          <Tooltip title="Play Video">
                            <Avatar
                              variant="rounded"
                              sx={{
                                cursor: "pointer",
                                bgcolor: "info.main",
                                width: 48,
                                height: 48,
                                "&:hover": {
                                  bgcolor: "info.dark",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                              }}
                              onClick={() => handleWatch(video.dropbox_link)}
                            >
                              <PlayArrowIcon />
                            </Avatar>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <MDTypography
                            variant="body2"
                            fontWeight="medium"
                            color="text"
                            sx={{
                              maxWidth: "400px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {video.file_name}
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDBox display="flex" alignItems="center" gap={1}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            <MDTypography variant="caption" color="text" opacity={0.7}>
                              {formatDate(video.uploaded_at)}
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell align="center">
                          {video.zip_link ? (
                            <Chip
                              label="Clips Ready"
                              color="success"
                              size="small"
                              sx={{ fontWeight: 600, color: "white !important" }}
                            />
                          ) : (
                            <Chip
                              label="Processing"
                              color="warning"
                              size="small"
                              sx={{ fontWeight: 600, color: "white !important" }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <MDBox display="flex" gap={1.5} justifyContent="left" flexWrap="wrap">
                            <Tooltip title="Download Video">
                              <IconButton
                                size="medium"
                                onClick={() => handleDownload(video.dropbox_link)}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  border: "2px solid",
                                  borderColor: "grey.300",
                                  backgroundColor: "transparent",
                                  "& svg": {
                                    color: "text.secondary",
                                    fontSize: 20,
                                  },
                                  "&:hover": {
                                    borderColor: "#4caf50",
                                    backgroundColor: "transparent",
                                    transform: "translateY(-2px)",
                                    "& svg": {
                                      color: "#4caf50",
                                    },
                                  },
                                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                              >
                                <CloudDownloadIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Get Stock Clips">
                              <IconButton
                                size="medium"
                                onClick={() => handleGetStockClips(video)}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  border: "2px solid",
                                  borderColor: "grey.300",
                                  backgroundColor: "transparent",
                                  "& svg": {
                                    color: "text.secondary",
                                    fontSize: 20,
                                  },
                                  "&:hover": {
                                    borderColor: "#2196f3",
                                    backgroundColor: "transparent",
                                    transform: "translateY(-2px)",
                                    "& svg": {
                                      color: "#2196f3",
                                    },
                                  },
                                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                              >
                                <SettingsIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete Video">
                              <IconButton
                                size="medium"
                                onClick={() => handleOpenDeleteModal(video.id)}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  border: "2px solid",
                                  borderColor: "grey.300",
                                  backgroundColor: "transparent",
                                  "& svg": {
                                    color: "text.secondary",
                                    fontSize: 20,
                                  },
                                  "&:hover": {
                                    borderColor: "#f44336",
                                    backgroundColor: "transparent",
                                    transform: "translateY(-2px)",
                                    "& svg": {
                                      color: "#f44336",
                                    },
                                  },
                                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>

                            {video.zip_link && (
                              <Tooltip title="Download Clips ZIP">
                                <IconButton
                                  size="medium"
                                  onClick={() => handleDownload(video.zip_link)}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    border: "2px solid",
                                    borderColor: "grey.300",
                                    backgroundColor: "transparent",
                                    "& svg": {
                                      color: "text.secondary",
                                      fontSize: 20,
                                    },
                                    "&:hover": {
                                      borderColor: "#ff9800",
                                      backgroundColor: "transparent",
                                      transform: "translateY(-2px)",
                                      "& svg": {
                                        color: "#ff9800",
                                      },
                                    },
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  }}
                                >
                                  <FileDownloadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </MDBox>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </MDBox>

            {/* Mobile Card View */}
            <MDBox
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <Grid container spacing={2}>
                {videos.map((video) => (
                  <Grid item xs={12} key={video.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <MDBox p={3}>
                        {/* Video Header */}
                        <MDBox
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={2}
                        >
                          <Tooltip title="Play Video">
                            <Avatar
                              variant="rounded"
                              sx={{
                                cursor: "pointer",
                                bgcolor: "info.main",
                                width: 56,
                                height: 56,
                                "&:hover": {
                                  bgcolor: "info.dark",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                              }}
                              onClick={() => handleWatch(video.dropbox_link)}
                            >
                              <PlayArrowIcon />
                            </Avatar>
                          </Tooltip>
                          {video.zip_link ? (
                            <Chip
                              label="Clips Ready"
                              color="success"
                              size="small"
                              sx={{ fontWeight: 600, color: "white !important" }}
                            />
                          ) : (
                            <Chip
                              label="Processing"
                              color="warning"
                              size="small"
                              sx={{ fontWeight: 600, color: "white !important" }}
                            />
                          )}
                        </MDBox>

                        {/* File Name */}
                        <MDTypography
                          variant="h6"
                          fontWeight="bold"
                          color="text"
                          mb={1.5}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {video.file_name}
                        </MDTypography>

                        {/* Upload Date */}
                        <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                          <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <MDTypography variant="caption" color="text" opacity={0.7}>
                            {formatDate(video.uploaded_at)}
                          </MDTypography>
                        </MDBox>

                        {/* Action Buttons */}
                        <MDBox display="flex" gap={1.5} flexWrap="wrap" justifyContent="center">
                          <Tooltip title="Download Video">
                            <IconButton
                              size="medium"
                              onClick={() => handleDownload(video.dropbox_link)}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                border: "2px solid",
                                borderColor: "grey.300",
                                backgroundColor: "transparent",
                                "& svg": {
                                  color: "text.secondary",
                                  fontSize: 20,
                                },
                                "&:hover": {
                                  borderColor: "#4caf50",
                                  backgroundColor: "transparent",
                                  transform: "translateY(-2px)",
                                  "& svg": {
                                    color: "#4caf50",
                                  },
                                },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            >
                              <CloudDownloadIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Get Stock Clips">
                            <IconButton
                              size="medium"
                              onClick={() => handleGetStockClips(video)}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                border: "2px solid",
                                borderColor: "grey.300",
                                backgroundColor: "transparent",
                                "& svg": {
                                  color: "text.secondary",
                                  fontSize: 20,
                                },
                                "&:hover": {
                                  borderColor: "#2196f3",
                                  backgroundColor: "transparent",
                                  transform: "translateY(-2px)",
                                  "& svg": {
                                    color: "#2196f3",
                                  },
                                },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            >
                              <SettingsIcon />
                            </IconButton>
                          </Tooltip>

                          {video.zip_link && (
                            <Tooltip title="Download Clips ZIP">
                              <IconButton
                                size="medium"
                                onClick={() => handleDownload(video.zip_link)}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  border: "2px solid",
                                  borderColor: "grey.300",
                                  backgroundColor: "transparent",
                                  "& svg": {
                                    color: "text.secondary",
                                    fontSize: 20,
                                  },
                                  "&:hover": {
                                    borderColor: "#ff9800",
                                    backgroundColor: "transparent",
                                    transform: "translateY(-2px)",
                                    "& svg": {
                                      color: "#ff9800",
                                    },
                                  },
                                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                              >
                                <FileDownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Delete Video">
                            <IconButton
                              size="medium"
                              onClick={() => handleOpenDeleteModal(video.id)}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                border: "2px solid",
                                borderColor: "grey.300",
                                backgroundColor: "transparent",
                                "& svg": {
                                  color: "text.secondary",
                                  fontSize: 20,
                                },
                                "&:hover": {
                                  borderColor: "#f44336",
                                  backgroundColor: "transparent",
                                  transform: "translateY(-2px)",
                                  "& svg": {
                                    color: "#f44336",
                                  },
                                },
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </MDBox>
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </MDBox>
          </>
        ) : (
          <MDBox
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
              borderRadius: 3,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              bgColor: "white",
            }}
          >
            <VideoLibraryIcon
              sx={{
                fontSize: 80,
                color: "text.secondary",
                opacity: 0.3,
                mb: 2,
              }}
            />
            <MDTypography variant="h5" fontWeight="medium" color="text" mb={1}>
              No Videos Yet
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.7} mb={3}>
              Upload your first video to get started
            </MDTypography>
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => navigate("/upload")}
              sx={{
                px: 4,
                py: 1.5,
              }}
            >
              Upload Video
            </MDButton>
          </MDBox>
        )}
      </MDBox>

      <DeleteVideo
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        videoId={videoToDelete}
      />
    </DashboardLayout>
  );
}

export default Dashboard;
