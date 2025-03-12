import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Material UI Components
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  useTheme,
} from "@mui/material";

// Material UI Icons
import TimelineIcon from "@mui/icons-material/Timeline";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const Stars = () => {
  // Generate random stars with different positions, sizes, and animation delays
  const stars = React.useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1, // 1-3px
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${Math.random() * 2 + 3}s`, // 3-5s
    }));
  }, []);

  const starColors = ["#fff", "#f8f8ff", "#f0f8ff", "#e6e6fa", "#b0e0e6"];

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {stars.map((star) => (
        <Box
          key={star.id}
          sx={{
            position: "absolute",
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            backgroundColor:
              starColors[Math.floor(Math.random() * starColors.length)],
            borderRadius: "50%",
            animation: `twinkle ${star.animationDuration} ease-in-out infinite`,
            animationDelay: star.animationDelay,
            opacity: 0.5,
          }}
        />
      ))}
    </Box>
  );
};

const Home = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // Stats data
  const statsData = [
    {
      title: "Track All Trades",
      value: "100%",
      trend: "+15%",
      icon: <TimelineIcon sx={{ color: "primary.main", fontSize: 28 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: "Win Rate",
      value: "63.4%",
      trend: "+2.3%",
      icon: <BarChartIcon sx={{ color: "#10b981", fontSize: 28 }} />,
      color: "#10b981", // green-500
    },
    {
      title: "Active Traders",
      value: "2,300",
      trend: "+3%",
      icon: <PeopleAltIcon sx={{ color: "#8b5cf6", fontSize: 28 }} />,
      color: "#8b5cf6", // purple-500
    },
    {
      title: "Trading Volume",
      value: "$103M",
      trend: "+5%",
      icon: <MonetizationOnIcon sx={{ color: "#06b6d4", fontSize: 28 }} />,
      color: "#06b6d4", // cyan-500
    },
  ];

  return (
    <>
      {/* Hero section */}
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          background:
            theme.palette.mode === "dark"
              ? "radial-gradient(ellipse at top, #1e3a8a 0%, #0f172a 50%, #0f172a 100%)"
              : "radial-gradient(ellipse at top, #f0f9ff 0%, #f1f5f9 60%, #f8fafc 100%)",
          overflow: "hidden",
          position: "relative",
          // Grid pattern
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(to right, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.1) 1px, transparent 1px)"
                : "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            zIndex: 0,
          },
        }}
      >
        {/* Stars component */}
        <Stars />

        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: theme.palette.primary.main,
            filter: "blur(150px)",
            opacity: theme.palette.mode === "dark" ? 0.15 : 0.05,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "#8b5cf6", // purple
            filter: "blur(150px)",
            opacity: theme.palette.mode === "dark" ? 0.1 : 0.05,
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 } }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                fontWeight: 700,
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(to right, #60a5fa, #3b82f6)"
                    : "linear-gradient(to right, #1e40af, #3b82f6)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Track Your Trades,
              <br />
              Improve Your Performance
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: "800px",
                mx: "auto",
                mb: 6,
              }}
            >
              A comprehensive trading journal to help you analyze your trades,
              track your performance, and identify winning patterns with
              advanced analytics.
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(to right, #3b82f6, #2563eb)"
                      : undefined,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 0 20px rgba(59, 130, 246, 0.5)"
                      : undefined,
                  "&:hover": {
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(to right, #2563eb, #1d4ed8)"
                        : undefined,
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 0 25px rgba(59, 130, 246, 0.7)"
                        : undefined,
                  },
                }}
              >
                Get started
              </Button>
              {!user && (
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{ py: 1.5, px: 4 }}
                >
                  Log in
                </Button>
              )}
            </Box>
          </Box>
        </Container>

        {/* Wave divider */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "100px",
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          >
            <defs>
              <linearGradient
                id="waveGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={
                    theme.palette.mode === "dark" ? "#0f172a" : "#f9fafb"
                  }
                />
                <stop
                  offset="100%"
                  stopColor={
                    theme.palette.mode === "dark" ? "#111827" : "#f1f5f9"
                  }
                />
              </linearGradient>
            </defs>
            <path
              d="M0,50 C150,20 350,0 500,20 C650,40 700,80 900,80 C1100,80 1300,40 1440,20 L1440,120 L0,120 Z"
              fill="url(#waveGradient)"
            />
          </svg>
        </Box>
      </Box>

      {/* Stats section */}
      <Box
        sx={{
          backgroundColor:
            theme.palette.mode === "dark" ? "#111827" : "#f1f5f9",
          py: { xs: 6, md: 10 },
          position: "relative",
          // Add a subtle top gradient to blend with the wave
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50px",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(to bottom, #0f172a, #111827)"
                : "linear-gradient(to bottom, #f9fafb, #f1f5f9)",
            opacity: 0.5,
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              TRACK BETTER
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mt: 1,
              }}
            >
              Everything you need to analyze your trades
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {statsData.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                    border:
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: `${stat.color}50`,
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? `0 0 20px ${stat.color}20`
                          : `0 4px 20px ${stat.color}10`,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ mt: 1, fontWeight: 700 }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(0,0,0,0.3)"
                              : "rgba(0,0,0,0.03)",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                      <ArrowUpwardIcon
                        sx={{ color: "#10b981", fontSize: 16, mr: 0.5 }}
                      />
                      <Typography variant="body2" sx={{ color: "#10b981" }}>
                        {stat.trend}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Box
        sx={{
          backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#fff",
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              {
                title: "Comprehensive Trading Journal",
                description:
                  "Track both stock and options trades with detailed metrics. Log entries, exits, position sizes, and implement your trading strategies with notes.",
                icon: (
                  <TimelineIcon
                    sx={{ fontSize: 40, color: theme.palette.primary.main }}
                  />
                ),
              },
              {
                title: "Advanced Performance Analytics",
                description:
                  "Visualize your trading performance with hourly analysis, P/L charts, and win-rate tracking. Identify your most profitable trading hours and patterns.",
                icon: (
                  <BarChartIcon
                    sx={{ fontSize: 40, color: theme.palette.primary.main }}
                  />
                ),
              },
              {
                title: "Professional Tools & Reports",
                description:
                  "Generate comprehensive reports, review trades with detailed notes, and track your account growth over time. Includes time-based filtering and trade type analysis.",
                icon: (
                  <MonetizationOnIcon
                    sx={{ fontSize: 40, color: theme.palette.primary.main }}
                  />
                ),
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                    border:
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main + "50",
                      transform: "translateY(-4px)",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                          : "0 10px 25px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing section */}
      <Box
        sx={{
          backgroundColor:
            theme.palette.mode === "dark" ? "#111827" : "#f1f5f9",
          py: { xs: 6, md: 10 },
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(to right, rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.06) 1px, transparent 1px)"
                : "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              PRICING
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mt: 1,
              }}
            >
              Simple, transparent pricing
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {/* Monthly Plan */}
            <Grid item xs={12} md={6} lg={5}>
              <Card
                sx={{
                  height: "100%",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                  border:
                    theme.palette.mode === "dark"
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 600 }}
                  >
                    Monthly Plan
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ mt: 3, fontWeight: 700 }}
                  >
                    $20
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      /month
                    </Typography>
                  </Typography>
                  <Box component="ul" sx={{ mt: 4, pl: 0, listStyle: "none" }}>
                    {[
                      "Full access to all trading analytics",
                      "Unlimited trade entries",
                      "Stock and options trading",
                      "Performance dashboards",
                    ].map((feature, i) => (
                      <Box
                        component="li"
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          mb: 2,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            color: theme.palette.primary.main,
                            mr: 1.5,
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                          }}
                        >
                          •
                        </Box>
                        <Typography>{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ mt: 4 }}>
                    <Button
                      component={Link}
                      to="/signup"
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{ py: 1.5 }}
                    >
                      Start monthly plan
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Yearly Plan */}
            <Grid item xs={12} md={6} lg={5}>
              <Card
                sx={{
                  height: "100%",
                  position: "relative",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                  border: `1px solid ${theme.palette.primary.main}30`,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 0 20px rgba(59, 130, 246, 0.1)"
                      : "0 4px 20px rgba(59, 130, 246, 0.1)",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderBottomLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  MOST POPULAR
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 600 }}
                  >
                    Yearly Plan
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ mt: 3, fontWeight: 700 }}
                  >
                    $200
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      /year
                    </Typography>
                  </Typography>
                  <Box component="ul" sx={{ mt: 4, pl: 0, listStyle: "none" }}>
                    {[
                      "All monthly features",
                      "Save $20 per year",
                      "Priority customer support",
                      "Early access to new features",
                    ].map((feature, i) => (
                      <Box
                        component="li"
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          mb: 2,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            color: theme.palette.primary.main,
                            mr: 1.5,
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                          }}
                        >
                          •
                        </Box>
                        <Typography>{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ mt: 4 }}>
                    <Button
                      component={Link}
                      to="/signup"
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
                        background:
                          theme.palette.mode === "dark"
                            ? "linear-gradient(to right, #3b82f6, #2563eb)"
                            : undefined,
                        "&:hover": {
                          background:
                            theme.palette.mode === "dark"
                              ? "linear-gradient(to right, #2563eb, #1d4ed8)"
                              : undefined,
                        },
                      }}
                    >
                      Start yearly plan
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Community section */}
      <Box
        sx={{
          backgroundColor: theme.palette.mode === "dark" ? "#0f172a" : "#fff",
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              COMMUNITY
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mt: 1,
                mb: 4,
              }}
            >
              Join fellow traders
            </Typography>

            <Paper
              elevation={theme.palette.mode === "dark" ? 0 : 1}
              sx={{
                p: 4,
                backgroundColor:
                  theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{ mb: 3, color: theme.palette.text.secondary }}
              >
                Connect with other traders, share insights, and learn from the
                community. Discuss trading strategies and market trends in a
                supportive environment designed for growth and success.
              </Typography>

              <Button
                component={Link}
                to="/community"
                variant="contained"
                size="large"
                sx={{ py: 1, px: 3 }}
              >
                Explore community
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor:
            theme.palette.mode === "dark" ? "#111827" : "#f1f5f9",
          py: 6,
          borderTop:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Rivyl
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A comprehensive trading journal to help you analyze trades and
                improve performance.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Links
              </Typography>
              <Box component="ul" sx={{ pl: 0, m: 0, listStyle: "none" }}>
                {[
                  { text: "Features", to: "/features" },
                  { text: "Pricing", to: "/pricing" },
                  { text: "Community", to: "/community" },
                ].map((link) => (
                  <Box component="li" key={link.text} sx={{ mb: 1 }}>
                    <Link
                      to={link.to}
                      style={{
                        color: theme.palette.text.secondary,
                        textDecoration: "none",
                        transition: "color 0.2s ease",
                      }}
                      className="hover:text-blue-400"
                    >
                      {link.text}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Legal
              </Typography>
              <Box component="ul" sx={{ pl: 0, m: 0, listStyle: "none" }}>
                {[
                  { text: "Privacy Policy", to: "/privacy-policy" },
                  { text: "Terms of Service", to: "/terms-of-service" },
                  { text: "My Account", to: "/profile" },
                ].map((link) => (
                  <Box component="li" key={link.text} sx={{ mb: 1 }}>
                    <Link
                      to={link.to}
                      style={{
                        color: theme.palette.text.secondary,
                        textDecoration: "none",
                        transition: "color 0.2s ease",
                      }}
                      className="hover:text-blue-400"
                    >
                      {link.text}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 6,
              pt: 3,
              borderTop:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.05)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © 2024 Rivyl. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Home;
