import React, { useState } from "react";
import PropTypes from "prop-types";
import { Grid, Card, CardContent, TextField, Fade, Alert, CircularProgress } from "@mui/material";
import {
  Email,
  Phone,
  LocationOn,
  AccessTime,
  Send,
  Support,
  ContactMail,
  LinkedIn,
  Twitter,
  Facebook,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import axiosInstance from "libs/axios";

// Custom Discord Icon
const DiscordIcon = ({ sx = {} }) => (
  <MDBox
    component="svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    sx={{ width: 24, height: 24, ...sx }}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928-1.793 6.4-2.221 8.549-2.221.1 0 .2.006.3.014a.077.077 0 0 1 .07.08c.004.05.002.1.002.15a.074.074 0 0 1-.01.033c-.095.3-.26.59-.49.838a.07.07 0 0 1-.08.02 13.165 13.165 0 0 1-1.895-.922.077.077 0 0 0-.09.012 11.85 11.85 0 0 0 .371.292.074.074 0 0 0 .078.01c.352.699.764 1.364 1.226 1.994a.077.077 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </MDBox>
);

DiscordIcon.propTypes = {
  sx: PropTypes.object,
};

// Custom Telegram Icon
const TelegramIcon = ({ sx = {} }) => (
  <MDBox
    component="svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    sx={{ width: 24, height: 24, ...sx }}
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.35-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z" />
  </MDBox>
);

TelegramIcon.propTypes = {
  sx: PropTypes.object,
};

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const socialLinks = [
    {
      icon: <LinkedIn />,
      name: "LinkedIn",
      link: "https://linkedin.com",
      color: "#0077b5",
    },
    {
      icon: <Twitter />,
      name: "Twitter",
      link: "https://twitter.com",
      color: "#1da1f2",
    },
    {
      icon: <Facebook />,
      name: "Facebook",
      link: "https://www.facebook.com/profile.php?id=61580811710096",
      color: "#1877f2",
    },
    {
      icon: <DiscordIcon />,
      name: "Discord",
      link: "https://discord.gg/QEqNZyQu",
      color: "#7289da",
    },
    {
      icon: <TelegramIcon />,
      name: "Telegram",
      link: "https://telegram.org",
      color: "#0088cc",
    },
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/contact/", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (response.data.message) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setError(response.data.error || "Failed to send message. Please try again later.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to send message. Please try again later.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        {/* Hero Section */}
        <MDBox
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 3,
            p: 6,
            mb: 4,
            textAlign: "center",
            color: "white",
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
          <MDBox position="relative" zIndex={1}>
            <ContactMail sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <MDTypography variant="h2" fontWeight="bold" color="white" mb={2}>
              Get In Touch
            </MDTypography>
            <MDTypography variant="h6" color="white" opacity={0.9} fontWeight="regular">
              We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as
              possible.
            </MDTypography>
          </MDBox>
        </MDBox>

        <Grid container spacing={4}>
          {/* Contact Information Cards */}
          <Grid item xs={12} md={4}>
            <MDBox>
              <MDTypography variant="h5" fontWeight="bold" mb={3}>
                Contact Information
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.8} mb={4}>
                Feel free to reach out to us through any of these channels. We&apos;re here to help!
              </MDTypography>

              {/* Social Media Links */}
              <MDBox mt={4}>
                <MDTypography variant="h6" fontWeight="bold" mb={2}>
                  Follow Us
                </MDTypography>
                <MDBox display="flex" gap={2} flexWrap="wrap">
                  {socialLinks.map((social, index) => (
                    <MDBox
                      key={index}
                      component="a"
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: "grey.300",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        backgroundColor: "transparent",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, ${social.color}15 0%, ${social.color}05 100%)`,
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                        },
                        "& svg": {
                          color: "text.secondary",
                          transition: "all 0.3s ease",
                          zIndex: 1,
                          position: "relative",
                        },
                        "&:hover": {
                          transform: "translateY(-6px) scale(1.05)",
                          borderColor: social.color,
                          boxShadow: `0 8px 24px ${social.color}25`,
                          "&::before": {
                            opacity: 1,
                          },
                          "& svg": {
                            color: social.color,
                            transform: "scale(1.1)",
                          },
                        },
                      }}
                    >
                      {React.cloneElement(social.icon, { sx: { fontSize: 26 } })}
                    </MDBox>
                  ))}
                </MDBox>
              </MDBox>
            </MDBox>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Fade in timeout={500}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                }}
              >
                <MDBox
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    p: 3,
                    color: "white",
                  }}
                >
                  <MDBox display="flex" alignItems="center" gap={2}>
                    <Support sx={{ fontSize: 32 }} />
                    <MDTypography variant="h5" fontWeight="bold" color="white">
                      Send Us a Message
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="body2" color="white" opacity={0.9} mt={1}>
                    Fill out the form below and we&apos;ll get back to you within 24 hours.
                  </MDTypography>
                </MDBox>

                <CardContent sx={{ p: 4 }}>
                  {success && (
                    <Fade in={success}>
                      <Alert
                        severity="success"
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setSuccess(false)}
                      >
                        <MDTypography variant="body2" fontWeight="medium">
                          Thank you! Your message has been sent successfully. We&apos;ll get back to
                          you soon.
                        </MDTypography>
                      </Alert>
                    </Fade>
                  )}

                  {error && (
                    <Fade in={!!error}>
                      <Alert
                        severity="error"
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setError("")}
                      >
                        <MDTypography variant="body2" fontWeight="medium">
                          {error}
                        </MDTypography>
                      </Alert>
                    </Fade>
                  )}

                  <MDBox component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <MDInput
                          label="Your Name"
                          fullWidth
                          value={formData.name}
                          onChange={handleChange("name")}
                          error={!!errors.name}
                          helperText={errors.name}
                          InputProps={{
                            startAdornment: (
                              <MDBox sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                                <ContactMail sx={{ color: "text.secondary", fontSize: 20 }} />
                              </MDBox>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <MDInput
                          type="email"
                          label="Your Email"
                          fullWidth
                          value={formData.email}
                          onChange={handleChange("email")}
                          error={!!errors.email}
                          helperText={errors.email}
                          InputProps={{
                            startAdornment: (
                              <MDBox sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                                <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                              </MDBox>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <MDInput
                          label="Subject"
                          fullWidth
                          value={formData.subject}
                          onChange={handleChange("subject")}
                          error={!!errors.subject}
                          helperText={errors.subject}
                          InputProps={{
                            startAdornment: (
                              <MDBox sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                                <Support sx={{ color: "text.secondary", fontSize: 20 }} />
                              </MDBox>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Your Message"
                          fullWidth
                          multiline
                          rows={6}
                          value={formData.message}
                          onChange={handleChange("message")}
                          error={!!errors.message}
                          helperText={errors.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <MDButton
                          type="submit"
                          variant="gradient"
                          color="info"
                          fullWidth
                          disabled={loading}
                          startIcon={!loading && <Send />}
                          sx={{
                            py: 1.5,
                            fontSize: "1rem",
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                            "&:hover": {
                              boxShadow: "0 6px 16px rgba(102, 126, 234, 0.5)",
                            },
                          }}
                        >
                          {loading ? (
                            <MDBox display="flex" alignItems="center" gap={1}>
                              <CircularProgress size={20} color="inherit" />
                              <span>Sending...</span>
                            </MDBox>
                          ) : (
                            "Send Message"
                          )}
                        </MDButton>
                      </Grid>
                    </Grid>
                  </MDBox>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Contact;
