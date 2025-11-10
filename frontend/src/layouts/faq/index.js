import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Fade, Card } from "@mui/material";
import {
  ExpandMore,
  HelpOutline,
  VideoLibrary,
  Payment,
  CloudUpload,
  AutoAwesome,
  Security,
  Support,
  Settings,
  QuestionAnswer,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const faqCategories = [
  {
    title: "Getting Started",
    icon: <VideoLibrary />,
    color: "#667eea",
    questions: [
      {
        question: "What is Auto-Clipper and how does it work?",
        answer:
          "Auto-Clipper is an AI-powered video processing service that automatically extracts stock clips from your videos. Simply upload your video, and our AI will transcribe it, detect keywords, and generate short stock clips based on the content. You can then download these clips as a ZIP file for use in your projects.",
      },
      {
        question: "Do I need to create an account to use the service?",
        answer:
          "Yes, you need to create a free account to use Auto-Clipper. Registration is quick and easy - just provide your name, email, and create a password. You'll get one free upload to try the service before subscribing to a paid plan.",
      },
      {
        question: "What video formats are supported?",
        answer:
          "Auto-Clipper supports all common video formats including MP4, MOV, AVI, MKV, and WebM. We recommend using MP4 format for the best compatibility and processing speed. Videos should be under 2GB in size for optimal performance.",
      },
      {
        question: "How long does it take to process a video?",
        answer:
          "Processing time depends on the length of your video. Typically, a 10-minute video takes about 2-5 minutes to process. Longer videos may take proportionally longer. You'll receive a notification once your stock clips are ready for download.",
      },
    ],
  },
  {
    title: "Pricing & Plans",
    icon: <Payment />,
    color: "#f5576c",
    questions: [
      {
        question: "What is the free trial and what does it include?",
        answer:
          "The free trial allows you to upload one video (up to 10 minutes) completely free. You get full access to all AI processing features, including transcription, keyword detection, and stock clip generation. No credit card is required to start your free trial.",
      },
      {
        question: "How does the pay-as-you-go plan work?",
        answer:
          "With the pay-as-you-go plan, you pay $1 per minute of video processed, with a minimum charge of $5 per upload. This plan is perfect if you only need to process videos occasionally. You only pay for what you use, with no monthly commitment.",
      },
      {
        question: "What's included in the Monthly subscription?",
        answer:
          "The Monthly plan costs $49/month and includes unlimited video uploads, priority AI processing (faster turnaround times), and 24/7 customer support. You can cancel anytime with no long-term commitment.",
      },
      {
        question: "What are the benefits of the Yearly plan?",
        answer:
          "The Yearly plan costs $500/year (equivalent to $41.67/month), saving you 15% compared to the monthly plan. You get all the benefits of the Monthly plan plus the best value for money. Perfect for creators who process videos regularly throughout the year.",
      },
      {
        question: "Can I change or cancel my subscription anytime?",
        answer:
          "Yes, you can upgrade, downgrade, or cancel your subscription at any time. Changes to your plan will take effect at the start of your next billing cycle. If you cancel, you'll continue to have access until the end of your current billing period.",
      },
    ],
  },
  {
    title: "Upload & Processing",
    icon: <CloudUpload />,
    color: "#11998e",
    questions: [
      {
        question: "What is the maximum video file size I can upload?",
        answer:
          "The maximum file size for uploads is 2GB. If your video is larger, we recommend compressing it or splitting it into smaller segments. This ensures optimal processing speed and reliability.",
      },
      {
        question: "How does the AI detect keywords and create clips?",
        answer:
          "Our AI uses advanced natural language processing to transcribe your video and identify important keywords and phrases. It then intelligently segments the video around these keywords, creating short, meaningful stock clips that capture the essence of your content.",
      },
      {
        question: "Can I choose which clips to include in the final ZIP?",
        answer:
          "Yes! After processing, you can review all generated clips and select which ones you want to keep. The system will only include your selected clips in the final ZIP file download.",
      },
      {
        question: "What aspect ratios are available for stock clips?",
        answer:
          "You can choose from multiple aspect ratios including 16:9 (landscape), 9:16 (portrait), 1:1 (square), and 4:5. This allows you to create clips optimized for different platforms like YouTube, Instagram, TikTok, and more.",
      },
    ],
  },
  {
    title: "Features & AI",
    icon: <AutoAwesome />,
    color: "#f6d365",
    questions: [
      {
        question: "How accurate is the AI transcription?",
        answer:
          "Our AI transcription is highly accurate, typically achieving 95%+ accuracy for clear audio. The accuracy may vary slightly depending on audio quality, background noise, accents, and technical terminology in your video.",
      },
      {
        question: "Can I edit the transcription before generating clips?",
        answer:
          "Currently, the transcription is automatically processed, but you can review and select which keywords to use for clip generation. We're working on adding manual transcription editing features in future updates.",
      },
      {
        question: "What languages are supported for transcription?",
        answer:
          "Currently, Auto-Clipper supports English transcription. We're actively working on adding support for multiple languages including Spanish, French, German, and more. Stay tuned for updates!",
      },
    ],
  },
  {
    title: "Security & Privacy",
    icon: <Security />,
    color: "#764ba2",
    questions: [
      {
        question: "Is my video data secure and private?",
        answer:
          "Absolutely! All video uploads are encrypted during transmission and storage. We use industry-standard security measures to protect your data. Videos are stored securely and are only accessible to you through your account.",
      },
      {
        question: "How long are my videos stored on your servers?",
        answer:
          "Your videos and generated clips are stored securely for 30 days after processing. After this period, they are automatically deleted from our servers. You can download your clips anytime during this 30-day window.",
      },
      {
        question: "Can I delete my videos manually?",
        answer:
          "Yes, you can delete any video from your dashboard at any time. Once deleted, the video and all associated clips will be permanently removed from our servers and cannot be recovered.",
      },
    ],
  },
  {
    title: "Support & Troubleshooting",
    icon: <Support />,
    color: "#38ef7d",
    questions: [
      {
        question: "What should I do if my video fails to process?",
        answer:
          "If your video fails to process, first check that it's in a supported format and under 2GB. Ensure the audio is clear and the video isn't corrupted. If issues persist, contact our support team with your video details and we'll help troubleshoot the problem.",
      },
      {
        question: "How can I contact customer support?",
        answer:
          "You can reach our customer support team through the Contact page in your dashboard. We typically respond within 24 hours. Premium subscribers get priority support with faster response times.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "We offer refunds for subscription plans within 7 days of purchase if you're not satisfied with the service. Pay-as-you-go charges are non-refundable once processing has begun, as the service has already been rendered.",
      },
    ],
  },
];

function FAQ() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        {/* Hero Section */}
        <MDBox
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            mb: 5,
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
            <QuestionAnswer sx={{ fontSize: { xs: 48, md: 64 }, mb: 2, opacity: 0.9 }} />
            <MDTypography
              variant="h2"
              fontWeight="bold"
              color="white"
              mb={2}
              sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
            >
              Frequently Asked Questions
            </MDTypography>
            <MDTypography
              variant="h6"
              color="white"
              opacity={0.9}
              fontWeight="regular"
              sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
            >
              Find answers to common questions about Auto-Clipper
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* FAQ Categories */}
        <Grid container spacing={4}>
          {faqCategories.map((category, categoryIndex) => (
            <Grid item xs={12} md={6} key={categoryIndex}>
              <Fade in timeout={300 + categoryIndex * 100}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid",
                    borderColor: "grey.200",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      transform: "translateY(-4px)",
                    },
                    overflow: "visible",
                  }}
                >
                  <MDBox p={3}>
                    {/* Category Header */}
                    <MDBox
                      display="flex"
                      alignItems="center"
                      gap={2}
                      mb={3}
                      sx={{
                        pb: 2,
                        borderBottom: "2px solid",
                        borderColor: "grey.100",
                      }}
                    >
                      <MDBox
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: `${category.color}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "transparent",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: category.color,
                            backgroundColor: `${category.color}10`,
                          },
                        }}
                      >
                        {React.cloneElement(category.icon, {
                          sx: { fontSize: 28, color: category.color },
                        })}
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="h5" fontWeight="bold" color="text">
                          {category.title}
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary" mt={0.5}>
                          {category.questions.length} questions
                        </MDTypography>
                      </MDBox>
                    </MDBox>

                    {/* Questions */}
                    <MDBox>
                      {category.questions.map((faq, faqIndex) => {
                        const panelId = `panel-${categoryIndex}-${faqIndex}`;
                        const isExpanded = expanded === panelId;
                        return (
                          <Accordion
                            key={faqIndex}
                            expanded={isExpanded}
                            onChange={handleChange(panelId)}
                            sx={{
                              mb: 1.5,
                              borderRadius: 2,
                              boxShadow: "none",
                              border: "1px solid",
                              borderColor: "grey.200",
                              backgroundColor: "transparent",
                              "&:before": {
                                display: "none",
                              },
                              "&.Mui-expanded": {
                                margin: "0 0 12px 0",
                                borderColor: category.color,
                                backgroundColor: `${category.color}05`,
                              },
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                borderColor: `${category.color}50`,
                                backgroundColor: `${category.color}03`,
                              },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={
                                <MDBox
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isExpanded ? category.color : "transparent",
                                    border: `1px solid ${isExpanded ? category.color : "grey.300"}`,
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  <ExpandMore
                                    sx={{
                                      color: isExpanded ? "white" : "text.secondary",
                                      fontSize: 20,
                                      transition: "transform 0.3s ease",
                                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                    }}
                                  />
                                </MDBox>
                              }
                              sx={{
                                px: 2.5,
                                py: 2,
                                "&.Mui-expanded": {
                                  minHeight: 56,
                                },
                                "& .MuiAccordionSummary-content": {
                                  margin: "12px 0",
                                },
                              }}
                            >
                              <MDTypography
                                variant="body1"
                                fontWeight="medium"
                                color="text"
                                sx={{
                                  pr: 2,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {faq.question}
                              </MDTypography>
                            </AccordionSummary>
                            <AccordionDetails
                              sx={{
                                px: 2.5,
                                py: 2,
                                pt: 0,
                              }}
                            >
                              <MDTypography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  lineHeight: 1.8,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {faq.answer}
                              </MDTypography>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </MDBox>
                  </MDBox>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Still Have Questions Section */}
        <MDBox
          mt={6}
          component={Card}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: "center",
            background: "transparent",
            border: "2px solid",
            borderColor: "grey.200",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: "#667eea",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
              transform: "translateY(-4px)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, #667eea08 0%, #764ba208 100%)",
              opacity: 0,
              transition: "opacity 0.3s ease",
              pointerEvents: "none",
            },
            "&:hover::before": {
              opacity: 1,
            },
          }}
        >
          <MDBox position="relative" zIndex={1}>
            <MDBox
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: "#667eea30",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                backgroundColor: "transparent",
                transition: "all 0.3s ease",
              }}
            >
              <QuestionAnswer sx={{ fontSize: 40, color: "#667eea" }} />
            </MDBox>
            <MDTypography
              variant="h4"
              fontWeight="bold"
              color="text"
              mb={2}
              sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
            >
              Still Have Questions?
            </MDTypography>
            <MDTypography
              variant="body1"
              color="text.secondary"
              mb={4}
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, maxWidth: "600px", mx: "auto" }}
            >
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help!
            </MDTypography>
            <MDBox
              component="a"
              href="/contact"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 4,
                py: 1.5,
                bgcolor: "#667eea",
                color: "white",
                borderRadius: 3,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  bgcolor: "#5568d3",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                },
              }}
            >
              <Support sx={{ fontSize: 20 }} />
              Contact Support
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default FAQ;
