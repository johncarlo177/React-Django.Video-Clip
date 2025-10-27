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

function PaymentStatus() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/api/admin-view-payment/");
        const filteredUsers = res.data.filter(
          (u) => !(u.username === "admin" && u.email === "admin@example.com")
        );
        setUsers(filteredUsers);
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
          💳 User Payment Status
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
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                        transition: "0.3s",
                      },
                    }}
                  >
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.plan}</TableCell>
                    <TableCell>${u.amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.payment_status}
                        color={getStatusColor(u.payment_status)}
                        variant="outlined"
                        sx={{ fontWeight: 500, textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      {u.expires_at ? new Date(u.expires_at).toLocaleString() : "—"}
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

export default PaymentStatus;
