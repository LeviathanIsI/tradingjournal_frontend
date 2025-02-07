// src/components/tours/TradersTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { tourStyles } from "./tourStyles";

const TradersTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="traders-content"]',
      content:
        "Welcome to the Traders section! Connect with fellow traders and build your network.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="traders-intro"]',
      content:
        "Discover traders with similar strategies and learn from their experiences.",
      placement: "bottom",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="traders-filters"]',
      content:
        "Filter traders by trading style, experience level, and performance metrics.",
      placement: "bottom",
    },
    {
      target: '[data-tour="traders-search"]',
      content:
        "Search for specific traders by name or trading characteristics.",
      placement: "bottom",
    },
    {
      target: '[data-tour="trader-card"]',
      content:
        "View detailed trader profiles including their stats, style, and recent activity.",
      placement: "top",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="trader-stats"]',
      content:
        "See key performance metrics like win rate, average profit, and total trades.",
      placement: "bottom",
    },
    {
      target: '[data-tour="trader-follow"]',
      content:
        "Follow traders to stay updated with their latest trades and insights.",
      placement: "left",
    },
    {
      target: '[data-tour="trader-connect"]',
      content: "Connect directly with traders to share ideas and strategies.",
      placement: "right",
    },
    {
      target: '[data-tour="trader-reviews"]',
      content:
        "Access traders' public trade reviews and learn from their analysis.",
      placement: "top",
      scrollToSteps: true,
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.tradersTourCompleted) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleJoyrideCallback = async (data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/auth/complete-tour/traders",
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
            tourStatus: { ...user.tourStatus, tradersTourCompleted: true },
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
      floaterProps={{
        disableAnimation: true,
      }}
      callback={handleJoyrideCallback}
      styles={tourStyles}
    />
  );
};

export default TradersTour;
