import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import axiosInstance from "libs/axios";

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const navigate = useNavigate();

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

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);

    try {
      // Trim email before sending
      const trimmedEmail = email.trim();
      const response = await axiosInstance.post("/api/signup/", {
        name: name.trim(),
        email: trimmedEmail,
        password,
      });

      const data = response.data;
      console.log(data);

      navigate("/sign-in", { state: { email: trimmedEmail, password } });
    } catch (err) {
      console.error("Error during sign up:", err);

      if (err.response) {
        if (err.response.data.error === "Email already exists") {
          setFormError("Email already exists. Please use a different email or sign in.");
        } else {
          setFormError("Something went wrong. Please try again.");
        }
      } else {
        setFormError("Network error. Please check your connection.");
      }
      setLoading(false);
    }
  };

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
            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
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
            <PersonAddIcon sx={{ fontSize: 48, color: "#11998e" }} />
          </MDBox>
          <MDTypography variant="h3" fontWeight="bold" color="white" mb={1}>
            Create Account
          </MDTypography>
          <MDTypography variant="body2" color="white" opacity={0.9}>
            Sign up to get started with your account
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={4} px={4}>
          <MDBox component="form" role="form" onSubmit={handleSignup} autoComplete="off">
            <MDBox mb={3}>
              <MDInput
                type="text"
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                FormHelperTextProps={{
                  sx: { color: "error.main", mt: 1, fontSize: "14px" },
                }}
                InputProps={{
                  startAdornment: (
                    <MDBox sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      <PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </MDBox>
                  ),
                }}
              />
            </MDBox>

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

            <MDBox mb={3}>
              <MDInput
                type="password"
                label="Confirm Password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
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
                color="success"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(17, 153, 142, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(17, 153, 142, 0.5)",
                  },
                  "&:disabled": {
                    boxShadow: "none",
                  },
                }}
              >
                {loading ? (
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Signing Up...</span>
                  </MDBox>
                ) : (
                  "Sign Up"
                )}
              </MDButton>
            </MDBox>

            <MDBox mt={3} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/sign-in"
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
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Cover;
