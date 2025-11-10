import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Fade, Chip } from "@mui/material";
import {
  ExpandMore,
  HelpOutline,
  VideoLibrary,
  Payment,
  CloudUpload,
  AutoAwesome,
  Security,
  Speed,
  Support,
  Settings,
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
            <HelpOutline sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <MDTypography variant="h2" fontWeight="bold" color="white" mb={2}>
              Frequently Asked Questions
            </MDTypography>
            <MDTypography variant="h6" color="white" opacity={0.9} fontWeight="regular">
              Find answers to common questions about Auto-Clipper
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* FAQ Categories */}
        <Grid container spacing={3}>
          {faqCategories.map((category, categoryIndex) => (
            <Grid item xs={12} key={categoryIndex}>
              <Fade in timeout={300 + categoryIndex * 100}>
                <MDBox
                  sx={{
                    mb: 4,
                  }}
                >
                  {/* Category Header */}
                  <MDBox
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={3}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
                      borderLeft: `4px solid ${category.color}`,
                    }}
                  >
                    <MDBox
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      {React.cloneElement(category.icon, { sx: { fontSize: 24 } })}
                    </MDBox>
                    <MDTypography variant="h5" fontWeight="bold" color="text">
                      {category.title}
                    </MDTypography>
                    {/* <Chip
                      label={`${category.questions.length} questions`}
                      size="small"
                      sx={{
                        bgcolor: `${category.color}20`,
                        color: category.color,
                        fontWeight: 600,
                      }}
                    /> */}
                  </MDBox>

                  {/* Questions */}
                  <MDBox>
                    {category.questions.map((faq, faqIndex) => {
                      const panelId = `panel-${categoryIndex}-${faqIndex}`;
                      return (
                        <Accordion
                          key={faqIndex}
                          expanded={expanded === panelId}
                          onChange={handleChange(panelId)}
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            "&:before": {
                              display: "none",
                            },
                            "&.Mui-expanded": {
                              margin: "0 0 16px 0",
                            },
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ExpandMore
                                sx={{
                                  color: category.color,
                                  fontSize: 28,
                                }}
                              />
                            }
                            sx={{
                              px: 3,
                              py: 2,
                              "&.Mui-expanded": {
                                minHeight: 56,
                                borderBottom: `1px solid ${category.color}20`,
                              },
                            }}
                          >
                            <MDTypography
                              variant="h6"
                              fontWeight="medium"
                              color="text"
                              sx={{
                                pr: 2,
                              }}
                            >
                              {faq.question}
                            </MDTypography>
                          </AccordionSummary>
                          <AccordionDetails
                            sx={{
                              px: 3,
                              py: 3,
                              bgcolor: "grey.50",
                            }}
                          >
                            <MDTypography
                              variant="body1"
                              color="text"
                              sx={{
                                lineHeight: 1.8,
                                opacity: 0.9,
                                fontSize: "1rem",
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
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Still Have Questions Section */}
        <MDBox
          mt={6}
          p={4}
          sx={{
            background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Settings sx={{ fontSize: 48, color: "white", mb: 2, opacity: 0.9 }} />
          <MDTypography variant="h4" fontWeight="bold" color="white" mb={2}>
            Still Have Questions?
          </MDTypography>
          <MDTypography variant="body1" color="white" opacity={0.9} mb={3}>
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help!
          </MDTypography>
          <MDBox
            component="a"
            href="/contact"
            sx={{
              display: "inline-block",
              px: 4,
              py: 1.5,
              bgcolor: "white",
              color: "#fda085",
              borderRadius: 2,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              },
            }}
          >
            Contact Support
          </MDBox>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default FAQ;
