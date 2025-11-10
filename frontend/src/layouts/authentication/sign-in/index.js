import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import LoginIcon from "@mui/icons-material/Login";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import axiosInstance from "libs/axios";

function Basic() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const queryEmail = queryParams.get("email");
  const queryPassword = queryParams.get("password");

  const getRememberedEmail = () => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    return rememberedEmail || "";
  };

  const [email, setEmail] = useState(location.state?.email || queryEmail || getRememberedEmail());
  const [password, setPassword] = useState(location.state?.password || queryPassword || "");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("remembered_email"));
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.setAttribute("autocomplete", "off");
    });
  }, []);

  // Comprehensive email validation function
  const validateEmail = (emailValue) => {
    if (!emailValue) {
      return "Email is required";
    }

    // Trim whitespace
    const trimmedEmail = emailValue.trim();

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address";
    }

    // Check for common email format issues
    if (trimmedEmail.includes("..")) {
      return "Email cannot contain consecutive dots";
    }

    if (trimmedEmail.startsWith(".") || trimmedEmail.endsWith(".")) {
      return "Email cannot start or end with a dot";
    }

    if (trimmedEmail.startsWith("@") || trimmedEmail.endsWith("@")) {
      return "Email format is invalid";
    }

    // Check domain has at least one dot after @
    const domainPart = trimmedEmail.split("@")[1];
    if (!domainPart || !domainPart.includes(".")) {
      return "Email domain is invalid";
    }

    // Check domain extension
    const domainParts = domainPart.split(".");
    if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
      return "Email domain extension is invalid";
    }

    return null; // Valid email
  };

  const validate = () => {
    const newErrors = {};

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time email validation
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setFormError(""); // Clear form error when user types

    // Only validate if field has been touched
    if (emailTouched) {
      const emailError = validateEmail(newEmail);
      if (emailError) {
        setErrors((prev) => ({ ...prev, email: emailError }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormError("");

    if (!validate()) {
      return false;
    }

    setLoading(true);

    try {
      // Trim email before sending
      const trimmedEmail = email.trim();
      const response = await axiosInstance.post("/api/signin/", {
        email: trimmedEmail,
        password,
      });

      const data = await response.data;

      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        if (rememberMe) {
          localStorage.setItem("remembered_email", trimmedEmail);
        } else {
          localStorage.removeItem("remembered_email");
        }

        navigate("/dashboard");
      } else {
        setFormError("Login failed: Invalid credentials.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed: Invalid credentials.";
      setFormError(errorMessage);
      setLoading(false);
    }

    return false;
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  return (
    <BasicLayout image="/assets/auth.jpg">
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        <MDBox
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            <LoginIcon sx={{ fontSize: 48, color: "#667eea" }} />
          </MDBox>
          <MDTypography variant="h3" fontWeight="bold" color="white" mb={1}>
            Welcome Back
          </MDTypography>
          <MDTypography variant="body2" color="white" opacity={0.9}>
            Sign in to your account to continue
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={4} px={4}>
          <MDBox
            component="form"
            role="form"
            onSubmit={handleSignin}
            autoComplete="off"
            noValidate
            sx={{ "& .MuiFormControl-root": { width: "100%" } }}
          >
            <MDBox mb={3}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                error={!!errors.email}
                helperText={errors.email}
                FormHelperTextProps={{
                  sx: { color: "error.main", mt: 1, fontSize: "14px" },
                }}
                InputProps={{
                  startAdornment: (
                    <MDBox sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      <EmailIcon
                        sx={{ color: errors.email ? "error.main" : "text.secondary", fontSize: 20 }}
                      />
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

            <MDBox mt={4} mb={2}>
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
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)",
                    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.5)",
                  },
                  "&:disabled": {
                    background: "rgba(102, 126, 234, 0.5)",
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

            <MDBox mt={3} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                  sx={{
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
