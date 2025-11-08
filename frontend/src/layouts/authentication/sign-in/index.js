import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import axiosInstance from "libs/axios";

function Basic() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get from navigation state or query string
  const queryParams = new URLSearchParams(location.search);
  const queryEmail = queryParams.get("email");
  const queryPassword = queryParams.get("password");

  // Load remembered email from localStorage if it exists
  const getRememberedEmail = () => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    return rememberedEmail || "";
  };

  const [email, setEmail] = useState(location.state?.email || queryEmail || getRememberedEmail());
  const [password, setPassword] = useState(location.state?.password || queryPassword || "");
  const [errors, setErrors] = useState({}); // field validation errors
  const [formError, setFormError] = useState(""); // server error
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("remembered_email"));
  const [loading, setLoading] = useState(false);

  // Disable browser autofill
  useEffect(() => {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.setAttribute("autocomplete", "off");
    });
  }, []);

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
      const response = await axiosInstance.post("/api/signin/", {
        email,
        password,
      });

      const data = await response.data;

      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        // Handle "Remember me" functionality
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
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
      setFormError("Login failed: Invalid credentials.");
      setLoading(false);
    }
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  return (
    <BasicLayout image="/assets/auth.jpg">
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignin} autoComplete="off">
            <MDInput
              type="email"
              label="Email"
              fullWidth
              sx={{ mb: 2 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              FormHelperTextProps={{
                sx: { color: "red", mt: 1, fontSize: "14px" },
              }}
            />
            <MDInput
              type="password"
              label="Password"
              fullWidth
              sx={{ mb: 2 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              FormHelperTextProps={{
                sx: { color: "red", mt: 1, fontSize: "14px" },
              }}
            />
            <MDBox display="flex" alignItems="center" ml={-1} mb={2}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>

            {/* Display server error */}
            {formError && (
              <MDTypography sx={{ color: "red", mb: 2, fontSize: "14px" }}>
                {formError}
              </MDTypography>
            )}

            <MDBox mt={2} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
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
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
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
