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
  Chip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
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
              <PaymentIcon sx={{ fontSize: 32, color: "white" }} />
            </MDBox>
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="white" mb={0.5}>
                Payment Status
              </MDTypography>
              <MDTypography variant="body2" color="white" opacity={0.9}>
                View payment information for all users
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {loading ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </MDBox>
        ) : users.length > 0 ? (
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
                    {users.map((u, i) => (
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
                          <MDBox display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "#667eea",
                                fontSize: "1rem",
                                fontWeight: "bold",
                              }}
                            >
                              {u.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <MDTypography variant="body1" fontWeight="medium" color="text">
                              {u.username}
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="body2" color="text">
                            {u.email}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={u.plan || "N/A"}
                            color="info"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="body1" fontWeight="bold" color="text">
                            ${u.amount || "0.00"}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={u.payment_status}
                            color={getStatusColor(u.payment_status)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              color: "white !important",
                              textTransform: "capitalize",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="body2" color="text.secondary">
                            {formatDate(u.created_at)}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="body2" color="text.secondary">
                            {formatDate(u.expires_at)}
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
                {users.map((u, i) => (
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
                        <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: "#667eea",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                            }}
                          >
                            {u.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <MDBox>
                            <MDTypography variant="h6" fontWeight="bold" color="text">
                              {u.username}
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary">
                              {u.email}
                            </MDTypography>
                          </MDBox>
                        </MDBox>

                        <MDBox display="flex" gap={1.5} flexWrap="wrap" mb={2}>
                          <Chip
                            label={u.plan || "N/A"}
                            color="info"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={`$${u.amount || "0.00"}`}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={u.payment_status}
                            color={getStatusColor(u.payment_status)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              color: "white !important",
                              textTransform: "capitalize",
                            }}
                          />
                        </MDBox>

                        <MDBox>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Created: {formatDate(u.created_at)}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Expires: {formatDate(u.expires_at)}
                          </MDTypography>
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
            <PaymentIcon
              sx={{
                fontSize: 80,
                color: "text.secondary",
                opacity: 0.3,
                mb: 2,
              }}
            />
            <MDTypography variant="h5" fontWeight="medium" color="text" mb={1}>
              No Payments Yet
            </MDTypography>
            <MDTypography variant="body2" color="text" opacity={0.7}>
              Payment information will appear here once users make payments
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default PaymentStatus;
