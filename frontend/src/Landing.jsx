import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const images = ["/assets/b1.jpg", "/assets/b2.jpg", "/assets/b3.jpg", "/assets/b4.jpg"];
const fullText =
  "Transform your raw footage into high-quality stock clips effortlessly. Upload, organize, and access your videos anytime, anywhere.";

function LandingPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  // Image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Typing effect
  useEffect(() => {
    let i = 0;
    setDisplayedText(""); // reset text on mount
    const typingInterval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(typingInterval);
    }, 50); // 50ms per character

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Top-right buttons */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="text"
            onClick={() => navigate("/sign-in")}
            sx={{
              color: "#fff",
              fontSize: "16px",
              backgroundColor: "transparent",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { backgroundColor: "transparent", boxShadow: "none" },
              "&:focus": { outline: "none" },
            }}
          >
            Sign In
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/sign-up")}
            sx={{
              color: "#fff",
              fontSize: "16px",
              backgroundColor: "transparent",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { backgroundColor: "transparent", boxShadow: "none" },
              "&:focus": { outline: "none" },
            }}
          >
            Sign Up
          </Button>
        </Stack>
      </Box>

      {/* Image slider */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
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
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))}
      </Box>

      {/* Centered landing content */}
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <Typography variant="h1" fontWeight="bold" sx={{ color: "#FFEA00" }} gutterBottom>
          Welcome to Video Clip
        </Typography>
        <Typography variant="h4" color="inherit" gutterBottom sx={{ minHeight: "100px" }}>
          {displayedText}
          <span style={{ borderRight: "2px solid #fff", marginLeft: "2px" }}></span>
        </Typography>
      </Container>
    </Box>
  );
}

export default LandingPage;
