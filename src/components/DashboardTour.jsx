// src/components/tours/DashboardTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { tourStyles } from "./tourStyles";
import { useLocation, useNavigate } from "react-router-dom";

const DashboardTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    {
      target: '[data-tour="stats-overview"]',
      content:
        "Here's your dashboard! Let's start with your key performance metrics.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-nav"]',
      content:
        "Use these tabs to navigate between different sections of your dashboard.",
      placement: "bottom",
    },
    {
      target: '[href="/dashboard/overview"]',
      content: "Overview shows your performance summary and recent activity.",
      placement: "bottom",
      spotlightClicks: true,
    },
    {
      target: '[href="/dashboard/journal"]',
      content:
        "Track all your trades in the journal. Add new trades, review past ones, and analyze your performance.",
      placement: "bottom",
      spotlightClicks: true,
    },
    {
      target: '[href="/dashboard/analysis"]',
      content:
        "Dive deep into your trading patterns with advanced charts and analytics.",
      placement: "bottom",
      spotlightClicks: true,
    },
    {
      target: '[href="/dashboard/planning"]',
      content:
        "Plan your trades using AI-powered insights based on your trading history.",
      placement: "bottom",
      spotlightClicks: true,
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.dashboardTourCompleted) {
      // Ensure we start at overview
      if (location.pathname !== "/dashboard/overview") {
        navigate("/dashboard/overview");
      }
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, location.pathname, navigate]);

  const handleJoyrideCallback = async (data) => {
    const { status, type, index } = data;

    // Handle step changes
    if (type === "step:after") {
      // Navigate based on step index if needed
      switch (index) {
        case 2: // After Overview tab explanation
          navigate("/dashboard/overview");
          break;
        case 3: // After Journal tab explanation
          navigate("/dashboard/journal");
          break;
        case 4: // After Analysis tab explanation
          navigate("/dashboard/analysis");
          break;
        case 5: // After Planning tab explanation
          navigate("/dashboard/planning");
          break;
        default:
          break;
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/auth/complete-tour/dashboard",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          updateUser({
            ...user,
            tourStatus: { ...user.tourStatus, dashboardTourCompleted: true },
          });
        }
      } catch (error) {
        console.error("Error completing tour:", error);
      }
      setRunTour(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      scrollToFirstStep
      scrollOffset={100}
      disableOverlayClose
      disableCloseOnEsc
      spotlightClicks={true}
      floaterProps={{
        disableAnimation: true,
      }}
      callback={handleJoyrideCallback}
      styles={tourStyles}
    />
  );
};

export default DashboardTour;
