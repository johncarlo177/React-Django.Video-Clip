import React from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Deliveries() {
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
              <LocalShippingIcon sx={{ fontSize: 32, color: "white" }} />
            </MDBox>
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="white" mb={0.5}>
                Deliveries
              </MDTypography>
              <MDTypography variant="body2" color="white" opacity={0.9}>
                Track and manage video deliveries
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Empty State */}
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
          <LocalShippingIcon
            sx={{
              fontSize: 80,
              color: "text.secondary",
              opacity: 0.3,
              mb: 2,
            }}
          />
          <MDTypography variant="h5" fontWeight="medium" color="text" mb={1}>
            No Deliveries Yet
          </MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.7}>
            Delivery information will appear here once available
          </MDTypography>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Deliveries;
