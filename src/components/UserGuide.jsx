// src/components/UserGuide.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";

const UserGuide = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
      if (user && !user.hasCompletedTour) {
        setRunTour(true);
      }
    }, 1000);
  }, [user]);

  const navigationSteps = [
    {
      target: '[data-tour="logo"]',
      content: "Welcome to Rivyl! Let us show you around.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard"]',
      content:
        "View your trading dashboard with performance metrics and recent trades.",
      placement: "bottom",
    },
    {
      target: '[data-tour="trade-planning"]',
      content: "Plan your trades and set your strategies.",
      placement: "bottom",
    },
    {
      target: '[data-tour="community"]',
      content:
        "Connect with other traders, share insights, and learn from the community.",
      placement: "bottom",
    },
    {
      target: '[data-tour="calculator"]',
      content: "Calculate position sizes and risk metrics quickly.",
      placement: "left",
    },
    {
      target: '[data-tour="settings"]',
      content: "Customize your preferences and account settings.",
      placement: "left",
    },
  ];

  const getDashboardSteps = () => [
    {
      target: '[data-tour="stats-overview"]',
      content: "Get a quick overview of your trading performance metrics.",
      placement: "bottom",
    },
    {
      target: '[data-tour="starting-capital"]',
      content:
        "This shows your initial investment. You can update this in settings.",
      placement: "bottom",
    },
    {
      target: '[data-tour="current-balance"]',
      content:
        "Track your current account balance and overall percentage gain/loss.",
      placement: "bottom",
    },
    {
      target: '[data-tour="performance-charts"]',
      content:
        "Visualize your trading performance over time with different metrics.",
      placement: "top",
    },
    {
      target: '[data-tour="chart-controls"]',
      content:
        "Switch between different chart views to analyze various aspects of your trading.",
      placement: "left",
    },
    {
      target: '[data-tour="trades-table"]',
      content: "View and manage all your trades in one place.",
      placement: "top",
    },
    {
      target: '[data-tour="add-trade"]',
      content: "Click here to log a new trade with all relevant details.",
      placement: "left",
    },
  ];

  const steps = useMemo(() => {
    if (location.pathname === "/dashboard") {
      return [...navigationSteps, ...getDashboardSteps()];
    }
    return navigationSteps;
  }, [location.pathname]);

  const handleTourCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      const token = localStorage.getItem("token");
      fetch("http://localhost:5000/api/auth/complete-tour", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            updateUser({ ...user, hasCompletedTour: true });
          }
        })
        .catch((error) => console.error("Error updating tour status:", error));

      setRunTour(false);
    }
  };

  if (!isReady) return null;

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      spotlightClicks
      callback={handleTourCallback}
      styles={{
        options: {
          primaryColor: "#3B82F6",
          textColor: "#1F2937",
          backgroundColor: "#FFFFFF",
          arrowColor: "#FFFFFF",
          overlayColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    />
  );
};

export default UserGuide;
