import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import axiosInstance from "libs/axios";

function AdminBasic() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState(location.state?.password || "");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/admin-signin/", {
        email,
        password,
      });

      const data = response.data;

      if (data.access) {
        localStorage.setItem("admin_token", data.access);
        navigate("/admin/dashboard");
      } else {
        setFormError("Invalid email or password");
        setLoading(false);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setFormError("Invalid email or password");
      } else {
        setFormError("Server error. Please try again later.");
      }
      console.error("Signin error:", err);
      setLoading(false);
    }
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  return (
    <BasicLayout image={bgImage}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        <MDBox
          sx={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            p: 4,
            textAlign: "center",
          }}
        >
          <MDBox
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 48, color: "#f5576c" }} />
          </MDBox>
          <MDTypography variant="h3" fontWeight="bold" color="white" mb={1}>
            Admin Portal
          </MDTypography>
          <MDTypography variant="body2" color="white" opacity={0.9}>
            Sign in to access the admin dashboard
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={4} px={4}>
          <MDBox component="form" role="form" onSubmit={handleSignin}>
            <MDBox mb={3}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                FormHelperTextProps={{
                  sx: { color: "error.main", mt: 1, fontSize: "14px" },
                }}
                InputProps={{
                  startAdornment: (
                    <MDBox sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </MDBox>
                  ),
                }}
              />
            </MDBox>

            <MDBox mb={3}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                FormHelperTextProps={{
                  sx: { color: "error.main", mt: 1, fontSize: "14px" },
                }}
                InputProps={{
                  startAdornment: (
                    <MDBox sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </MDBox>
                  ),
                }}
              />
            </MDBox>

            <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <MDBox display="flex" alignItems="center">
                <Switch
                  checked={rememberMe}
                  onChange={handleSetRememberMe}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "info.main",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "info.main",
                    },
                  }}
                />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  onClick={handleSetRememberMe}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Remember me
                </MDTypography>
              </MDBox>
            </MDBox>

            {formError && (
              <Fade in={!!formError}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  <MDTypography variant="body2" fontWeight="medium">
                    {formError}
                  </MDTypography>
                </Alert>
              </Fade>
            )}

            <MDBox mt={2} mb={2}>
              <MDButton
                type="submit"
                variant="gradient"
                color="info"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  boxShadow: "0 4px 12px rgba(245, 87, 108, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #e081e8 0%, #e44a5f 100%)",
                    boxShadow: "0 6px 16px rgba(245, 87, 108, 0.5)",
                  },
                  "&:disabled": {
                    background: "rgba(245, 87, 108, 0.5)",
                    boxShadow: "none",
                  },
                }}
              >
                {loading ? (
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Signing In...</span>
                  </MDBox>
                ) : (
                  "Sign In"
                )}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default AdminBasic;
