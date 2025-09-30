import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

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
  const [errors, setErrors] = useState({}); // field validation errors
  const [formError, setFormError] = useState(""); // server error
  const [rememberMe, setRememberMe] = useState(false);

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

    try {
      const response = await axiosInstance.post("/api/admin-signin/", {
        email,
        password,
      });

      const data = await response.data;

      if (data.access) {
        localStorage.setItem("admin-token", data.access);
        navigate("/admin/dashboard");
      } else {
        setFormError("Login failed: Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Login failed: Invalid credentials.");
    }
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  return (
    <BasicLayout image={bgImage}>
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
          <MDBox component="form" role="form" onSubmit={handleSignin}>
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
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                Sign In
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default AdminBasic;
