import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axiosInstance from "libs/axios";

function Dashboard() {
  const [videos, setVideos] = useState([]);

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
                        src={`https://via.placeholder.com/80x60.png?text=Video`}
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleWatch(video.dropbox_link)}
                      />
                    </TableCell>
                    <TableCell>{video.file_name}</TableCell>
                    <TableCell>{new Date(video.uploaded_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDownload(video.dropbox_link)}>
                        <CloudDownloadIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" size="small">
                        Handle
                      </Button>
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
    </DashboardLayout>
  );
}

export default Dashboard;
