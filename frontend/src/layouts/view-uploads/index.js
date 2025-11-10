import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import axiosInstance from "libs/axios";

function ViewUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axiosInstance.get("/api/admin-view-upload/");
        const cleaned = res.data.map((item) => {
          let cleanDropbox = item.dropbox_link;
          if (cleanDropbox) {
            cleanDropbox = cleanDropbox.replace(/(\?dl=1|&dl=1)$/i, "");
          }
          return { ...item, dropbox_link: cleanDropbox };
        });
        setUploads(cleaned);
      } catch (err) {
        console.error("Failed to fetch uploads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
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
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 3,
            p: 4,
            mb: 4,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            },
          }}
        >
          <MDBox position="relative" zIndex={1} display="flex" alignItems="center" gap={2}>
            <MDBox
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <VideoLibraryIcon sx={{ fontSize: 32, color: "white" }} />
            </MDBox>
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="white" mb={0.5}>
                Uploaded Videos
              </MDTypography>
              <MDTypography variant="body2" color="white" opacity={0.9}>
                View all videos uploaded by users
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {loading ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </MDBox>
        ) : uploads.length > 0 ? (
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
                    {uploads.map((u, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          "&:hover": {
                            backgroundColor: "grey.50",
                            transition: "0.3s",
                          },
                        }}
                      >
                        <TableCell>
                          <MDTypography variant="body1" fontWeight="medium" color="text">
                            {u.username}
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="body2" color="text">
                            {u.email}
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography
                            variant="body2"
                            color="text"
                            sx={{
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {u.file_name}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          {u.dropbox_link ? (
                            <Tooltip title="View Video">
                              <IconButton
                                size="medium"
                                href={u.dropbox_link}
                                target="_blank"
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
                                <OpenInNewIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <MDTypography variant="body2" color="text.secondary">
                              —
                            </MDTypography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {u.zip_link ? (
                            <Tooltip title="Download ZIP">
                              <IconButton
                                size="medium"
                                href={u.zip_link}
                                target="_blank"
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
                          ) : (
                            <MDTypography variant="body2" color="text.secondary">
                              —
                            </MDTypography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="body2" color="text.secondary">
                            {formatDate(u.uploaded_at)}
                          </MDTypography>
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
                {uploads.map((u, i) => (
                  <Grid item xs={12} key={i}>
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
                        <MDBox mb={2}>
                          <MDTypography variant="h6" fontWeight="bold" color="text" mb={0.5}>
                            {u.username}
                          </MDTypography>
                          <MDTypography variant="body2" color="text.secondary" mb={1}>
                            {u.email}
                          </MDTypography>
                          <MDTypography
                            variant="body2"
                            color="text"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {u.file_name}
                          </MDTypography>
                        </MDBox>

                        <MDBox
                          display="flex"
                          gap={1.5}
                          flexWrap="wrap"
                          justifyContent="center"
                          mb={2}
                        >
                          {u.dropbox_link && (
                            <MDButton
                              variant="outlined"
                              size="small"
                              href={u.dropbox_link}
                              target="_blank"
                              startIcon={<OpenInNewIcon />}
                              sx={{
                                borderColor: "grey.300",
                                color: "text.secondary",
                                "&:hover": {
                                  borderColor: "#2196f3",
                                  color: "#2196f3",
                                },
                              }}
                            >
                              View Video
                            </MDButton>
                          )}
                          {u.zip_link && (
                            <MDButton
                              variant="outlined"
                              size="small"
                              href={u.zip_link}
                              target="_blank"
                              startIcon={<FileDownloadIcon />}
                              sx={{
                                borderColor: "grey.300",
                                color: "text.secondary",
                                "&:hover": {
                                  borderColor: "#ff9800",
                                  color: "#ff9800",
                                },
                              }}
                            >
                              Download ZIP
                            </MDButton>
                          )}
                        </MDBox>

                        <MDTypography variant="caption" color="text.secondary">
                          {formatDate(u.uploaded_at)}
                        </MDTypography>
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
              No Uploads Yet
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.7}>
              Videos will appear here once users upload them
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default ViewUploads;
