// src/components/tours/TradePlanningTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { tourStyles } from "./tourStyles";

const TradePlanningTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);

  // Define steps once all elements are mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setSteps([
        {
          target: '[data-tour="plan-info"]',
          content:
            "Welcome to Trade Planning! This is where you'll prepare and analyze your trades before execution.",
          placement: "bottom",
          disableBeacon: true,
        },
        {
          target: '[data-tour="plan-stats"]',
          content: "Track your planning effectiveness with key metrics.",
          placement: "bottom",
        },
        {
          target: '[data-tour="plan-management"]',
          content:
            "Switch between list and grid views, update plan statuses, and track execution.",
          placement: "bottom",
        },
        {
          target: '[data-tour="create-plan"]',
          content:
            "Create new trade plans with detailed entry and exit criteria.",
          placement: "left",
        },
        {
          target: '[data-tour="plans-list"]',
          content: "Review and manage all your trade plans here.",
          placement: "top",
        },
      ]);
    }, 500); // Wait for elements to mount

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (
      user &&
      !user.tourStatus?.tradePlanningTourCompleted &&
      steps.length > 0
    ) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, steps]);

  const handleJoyrideCallback = async (data) => {
    const { status, type } = data;

    // Handle step transitions
    if (type === "step:after") {
      // Add any specific step handling if needed
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/auth/complete-tour/tradePlanning",
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
            tourStatus: {
              ...user.tourStatus,
              tradePlanningTourCompleted: true,
            },
          });
        }
      } catch (error) {
        console.error("Error completing tour:", error);
      }
      setRunTour(false);
    }
  };

  // Don't render the tour if no steps are available
  if (steps.length === 0) return null;

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

export default TradePlanningTour;
