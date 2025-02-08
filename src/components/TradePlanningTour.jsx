// src/components/tours/TradePlanningTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { tourStyles } from "./tourStyles";

const TradePlanningTour = () => {
  const { user, updateUser } = useAuth();
  const { activeTour, setActiveTour } = useTour();
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);

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
          target: '[data-tour="plan-management"]',
          content:
            "Switch between list and grid views, update plan statuses, and track execution.",
          placement: "bottom",
        },
        {
          target: '[data-tour="plan-metrics-info"]',
          content:
            "Understand your planning metrics and performance indicators.",
          placement: "bottom",
        },
        {
          target: '[data-tour="plan-stats"]',
          content: "Track your planning effectiveness with key metrics.",
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
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (
      user &&
      !user.tourStatus?.tradePlanningTourCompleted &&
      !activeTour &&
      steps.length > 0
    ) {
      setActiveTour("tradePlanning");
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, activeTour, steps]);

  const handleJoyrideCallback = async (data) => {
    const { status } = data;

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
      setActiveTour(null);
    }
  };

  if (activeTour !== "tradePlanning") return null;
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
      floaterProps={{
        disableAnimation: true,
      }}
      callback={handleJoyrideCallback}
      styles={tourStyles}
    />
  );
};

export default TradePlanningTour;
