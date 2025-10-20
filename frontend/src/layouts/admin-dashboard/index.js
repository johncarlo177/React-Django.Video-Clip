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
  Chip,
  Box,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axiosInstance from "libs/axios";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/api/admin-dashboard/");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          👥 User Lists
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
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Table>
              <TableBody>
                {users.map((u, i) => (
                  <TableRow
                    key={i}
                    sx={{
                      paddingX: "10px",
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                        transition: "0.3s",
                      },
                    }}
                  >
                    <TableCell sx={{ paddingLeft: "30px" }}>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.uploaded_count}{" "}
                      {u.uploaded_count === 1 || u.uploaded_count === 0 ? "video" : "videos"}{" "}
                      uploaded
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.payment_status || "No Payment"}
                        color={getStatusColor(u.payment_status)}
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
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

export default AdminDashboard;
