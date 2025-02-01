// src/components/tours/DashboardTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";

const DashboardTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="stats-overview"]',
      content: "Your trading performance at a glance.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="starting-capital"]',
      content: "Your initial investment.",
      placement: "bottom",
    },
    {
      target: '[data-tour="current-balance"]',
      content: "Current account value and overall profit/loss.",
      placement: "bottom",
    },
    {
      target: '[data-tour="exit-analysis"]',
      content:
        "Our AI analyzes your trading history to suggest optimal exit points based on your past performance.",
      placement: "bottom",
    },
    {
      target: '[data-tour="performance-charts"]',
      content: "Visualize your trading performance over time.",
      placement: "top",
    },
    {
      target: '[data-tour="chart-controls"]',
      content:
        "Switch between different types of analysis - P/L over time, trading patterns, drawdowns, and winning streaks.",
      placement: "bottom",
    },
    {
      target: '[data-tour="trades-table"]',
      content: "View and manage all your trades in one place.",
      placement: "top",
    },
    {
      target: '[data-tour="add-trade"]',
      content: "Log new trades with detailed entry and exit information.",
      placement: "left",
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.dashboardTourCompleted) {
      setRunTour(true);
    }
  }, [user]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      fetch("http://localhost:5000/api/auth/complete-tour/dashboard", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            updateUser({
              ...user,
              tourStatus: { ...user.tourStatus, dashboardTourCompleted: true },
            });
          }
        });
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
      spotlightClicks
      disableOverlayClose
      disableCloseOnEsc
      callback={handleJoyrideCallback}
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

export default DashboardTour;
