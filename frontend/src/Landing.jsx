import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Fade, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const images = ["/assets/b1.jpg", "/assets/b2.jpg", "/assets/b3.jpg", "/assets/b4.jpg"];
const fullText =
  "Transform your raw footage into high-quality stock clips effortlessly. Upload, organize, and access your videos anytime, anywhere.";

const features = [
  {
    icon: <CloudUploadIcon sx={{ fontSize: 48 }} />,
    title: "Easy Upload",
    description: "Upload your videos with a simple drag-and-drop interface. Fast and secure.",
    color: "#667eea",
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
    title: "AI-Powered",
    description: "Advanced AI automatically detects keywords and generates relevant stock clips.",
    color: "#f093fb",
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 48 }} />,
    title: "Lightning Fast",
    description: "Process your videos quickly with our optimized cloud infrastructure.",
    color: "#4facfe",
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 48 }} />,
    title: "Secure Storage",
    description: "Your videos are safely stored in the cloud with enterprise-grade security.",
    color: "#43e97b",
  },
  {
    icon: <VideoLibraryIcon sx={{ fontSize: 48 }} />,
    title: "Organized Library",
    description: "Manage all your videos and stock clips in one convenient location.",
    color: "#fa709a",
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 48 }} />,
    title: "Grow Your Business",
    description: "Scale your content creation with professional stock clip management.",
    color: "#fee140",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [showFeatures, setShowFeatures] = useState(false);

  // Image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Typing effect
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const typingInterval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) {
        clearInterval(typingInterval);
        setTimeout(() => setShowFeatures(true), 500);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  // Scroll to features
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", backgroundColor: "#000" }}>
      {/* Navigation Bar */}
      <MDBox
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          py: 2,
          px: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="xl">
          <MDBox display="flex" alignItems="center" justifyContent="space-between">
            <MDBox display="flex" alignItems="center" gap={1}>
              <VideoLibraryIcon sx={{ fontSize: 32, color: "white !important" }} />
              <MDTypography variant="h5" fontWeight="bold" color="white">
                Auto Clipper
              </MDTypography>
            </MDBox>
            <MDBox display="flex" gap={2}>
              <MDButton
                variant="outlined"
                color="white"
                onClick={() => navigate("/sign-in")}
                sx={{
                  px: 3,
                  py: 1,
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Sign In
              </MDButton>
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => navigate("/sign-up")}
                sx={{
                  px: 3,
                  py: 1,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.5)",
                  },
                }}
              >
                Get Started
              </MDButton>
            </MDBox>
          </MDBox>
        </Container>
      </MDBox>

      {/* Hero Section with Image Slider */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Image slider */}
        {images.map((img, index) => (
          <Box
            key={index}
            component="img"
            src={img}
            alt={`slide-${index}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: index === currentIndex ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
              transform: index === currentIndex ? "scale(1)" : "scale(1.1)",
            }}
          />
        ))}

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)",
            zIndex: 2,
          }}
        />

        {/* Hero Content */}
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
            color: "#fff",
            pt: 10,
          }}
        >
          <Fade in timeout={1000}>
            <MDBox>
              <MDBox
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": {
                      transform: "scale(1)",
                    },
                    "50%": {
                      transform: "scale(1.05)",
                    },
                  },
                }}
              >
                <VideoLibraryIcon sx={{ fontSize: 64, color: "#667eea" }} />
              </MDBox>

              <MDTypography
                variant={isMobile ? "h2" : "h1"}
                fontWeight="bold"
                color="white"
                mb={2}
                sx={{
                  textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                }}
              >
                Welcome to Video Auto Clipper
              </MDTypography>

              <MDTypography
                variant={isMobile ? "h6" : "h5"}
                color="white"
                mb={4}
                sx={{
                  minHeight: isMobile ? "80px" : "100px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  opacity: 0.95,
                }}
              >
                {displayedText}
                <span
                  style={{
                    borderRight: "2px solid #fff",
                    marginLeft: "4px",
                    animation: "blink 1s infinite",
                  }}
                />
                <style>
                  {`
                    @keyframes blink {
                      0%, 50% { opacity: 1; }
                      51%, 100% { opacity: 0; }
                    }
                  `}
                </style>
              </MDTypography>

              <MDBox display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                <MDButton
                  variant="gradient"
                  color="info"
                  size="large"
                  onClick={() => navigate("/sign-up")}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.5)",
                    "&:hover": {
                      boxShadow: "0 6px 24px rgba(102, 126, 234, 0.6)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Get Started Free
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="white"
                  size="large"
                  startIcon={<PlayCircleOutlineIcon />}
                  onClick={scrollToFeatures}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderColor: "white",
                    color: "white",
                    borderWidth: 2,
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderWidth: 2,
                    },
                  }}
                >
                  Learn More
                </MDButton>
              </MDBox>
            </MDBox>
          </Fade>
        </Container>

        {/* Scroll Indicator */}
        <MDBox
          sx={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            animation: "bounce 2s infinite",
            "@keyframes bounce": {
              "0%, 100%": {
                transform: "translateX(-50%) translateY(0)",
              },
              "50%": {
                transform: "translateX(-50%) translateY(-10px)",
              },
            },
          }}
        >
          <MDTypography variant="body2" color="white" sx={{ opacity: 0.8 }}>
            Scroll to explore
          </MDTypography>
        </MDBox>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        sx={{
          position: "relative",
          bgcolor: "white",
          py: { xs: 8, md: 12 },
          mt: -1,
          height: "100vh",
        }}
      >
        <Container maxWidth="xl">
          <Fade in={showFeatures} timeout={1000}>
            <MDBox textAlign="center" mb={6}>
              <MDTypography variant="h2" fontWeight="bold" color="text" mb={2}>
                Powerful Features
              </MDTypography>
              <MDTypography variant="h6" color="white" maxWidth="600px" mx="auto">
                Everything you need to transform your videos into professional stock clips
              </MDTypography>
            </MDBox>
          </Fade>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in={showFeatures} timeout={500 + index * 100}>
                  <MDBox
                    sx={{
                      height: "100%",
                      p: 4,
                      borderRadius: 3,
                      bgcolor: "white",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      border: "1px solid",
                      borderColor: "grey.200",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        borderColor: feature.color,
                        borderWidth: 2,
                      },
                    }}
                  >
                    <MDBox
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        bgcolor: `${feature.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </MDBox>
                    <MDTypography variant="h5" fontWeight="bold" color="text" mb={2}>
                      {feature.title}
                    </MDTypography>
                    <MDTypography variant="body1" color="white" fontSize="1rem">
                      {feature.description}
                    </MDTypography>
                  </MDBox>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "grey.900",
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Container maxWidth="md">
          <MDBox textAlign="center" color="white">
            <MDTypography variant="h2" fontWeight="bold" color="white" mb={2}>
              Ready to Get Started?
            </MDTypography>
            <MDTypography variant="h6" color="white" opacity={0.9} mb={4}>
              Join thousands of creators transforming their videos into professional stock clips
            </MDTypography>
            <MDButton
              variant="gradient"
              color="white"
              size="large"
              onClick={() => navigate("/sign-up")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.2rem",
                fontWeight: 600,
                bgcolor: "white",
                color: "#667eea",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                "&:hover": {
                  bgcolor: "grey.100",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Create Your Account
            </MDButton>
          </MDBox>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
