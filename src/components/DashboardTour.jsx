// src/components/tours/DashboardTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { tourStyles } from "./tourStyles";
import { useNavigate } from "react-router-dom";

const DashboardTour = () => {
  const { user, updateUser } = useAuth();
  const { activeTour, setActiveTour } = useTour();
  const [runTour, setRunTour] = useState(false);
  const navigate = useNavigate();

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
      content: "Track all your trades in the journal.",
      placement: "bottom",
      spotlightClicks: true,
    },
    {
      target: '[href="/dashboard/analysis"]',
      content: "Dive deep into your trading patterns.",
      placement: "bottom",
      spotlightClicks: true,
    },
    {
      target: '[href="/dashboard/planning"]',
      content: "Plan your trades using AI-powered insights.",
      placement: "bottom",
      spotlightClicks: true,
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.dashboardTourCompleted && !activeTour) {
      setActiveTour("dashboard");
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, activeTour]);

  const handleJoyrideCallback = async (data) => {
    const { status, type, index } = data;

    if (type === "step:after") {
      switch (index) {
        case 2:
          navigate("/dashboard/overview");
          break;
        case 3:
          navigate("/dashboard/journal");
          break;
        case 4:
          navigate("/dashboard/analysis");
          break;
        case 5:
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
      setActiveTour(null);
    }
  };

  if (activeTour !== "dashboard") return null;

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
