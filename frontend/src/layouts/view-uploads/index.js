import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          🎥 Uploaded Videos
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="40vh">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={4}
            sx={{
              borderRadius: 3,
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Table>
              <TableBody>
                {uploads.map((u, i) => (
                  <TableRow
                    key={i}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                        transition: "0.3s",
                      },
                    }}
                  >
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.file_name}</TableCell>
                    <TableCell>
                      {u.dropbox_link ? (
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          href={u.dropbox_link}
                          target="_blank"
                        >
                          View File
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {u.zip_link ? (
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          href={u.zip_link}
                          target="_blank"
                        >
                          Download ZIP
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{u.uploaded_at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default ViewUploads;
