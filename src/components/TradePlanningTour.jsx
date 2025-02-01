// src/components/tours/TradePlanningTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";

const TradePlanningTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="plan-stats"]',
      content:
        "Track your planning performance with key metrics like success rate and risk-reward ratios.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="create-plan"]',
      content:
        "Create detailed trade plans before entering positions. Define your entry, exit, and risk management strategy.",
      placement: "left",
    },
    {
      target: '[data-tour="plans-list"]',
      content:
        "Review and manage all your trade plans. Track which setups work best for you.",
      placement: "top",
    },
    {
      target: '[data-tour="view-controls"]',
      content: "Switch between list and grid views to analyze your plans.",
      placement: "bottom",
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.tradePlanningTourCompleted) {
      setRunTour(true);
    }
  }, [user]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      fetch("http://localhost:5000/api/auth/complete-tour/tradePlanning", {
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
              tourStatus: {
                ...user.tourStatus,
                tradePlanningTourCompleted: true,
              },
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

export default TradePlanningTour;
