import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
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

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/signup/", {
        name,
        email,
        password,
      });

      const data = response.data;
      console.log(data);

      // Redirect to sign-in page with prefilled credentials
      navigate("/sign-in", { state: { email, password } });
    } catch (err) {
      console.error("Error during sign up:", err);

      if (err.response) {
        if (err.response.data.error === "Email already exists") {
          setErrors((prev) => ({ ...prev, email: "Email already exists" }));
        } else {
          alert("Something went wrong. Please try again.");
        }
      } else {
        alert("Network error. Please check your connection.");
      }
      setLoading(false);
    }
  };

  const helperTextProps = { sx: { color: "red", mt: 1 } };

  return (
    <BasicLayout image="/assets/auth.jpg">
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign Up
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignup} autoComplete="off">
            <MDInput
              type="text"
              label="Name"
              variant="standard"
              fullWidth
              sx={{ mb: 2 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              FormHelperTextProps={helperTextProps}
            />
            <MDInput
              type="email"
              label="Email"
              variant="standard"
              fullWidth
              sx={{ mb: 2 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              FormHelperTextProps={helperTextProps}
            />
            <MDInput
              type="password"
              label="Password"
              variant="standard"
              fullWidth
              sx={{ mb: 2 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              FormHelperTextProps={helperTextProps}
            />
            <MDInput
              type="password"
              label="Confirm Password"
              variant="standard"
              fullWidth
              sx={{ mb: 2 }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              FormHelperTextProps={helperTextProps}
            />
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
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

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
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
