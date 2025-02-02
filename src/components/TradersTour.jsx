// components/tours/TradersTour.jsx
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
      content: "Discover and connect with fellow traders in the community.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="traders-search"]',
      content: "Search for traders by name or trading style.",
      placement: "bottom",
    },
    {
      target: '[data-tour="trader-card"]',
      content:
        "View trader profiles with their stats, trading style, and follow them to stay connected.",
      placement: "top",
    },
    {
      target: '[data-tour="trader-stats"]',
      content:
        "See key performance metrics like total trades, win rate, and profit.",
      placement: "bottom",
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
      disableOverlayClose
      disableCloseOnEsc
      callback={handleJoyrideCallback}
      styles={tourStyles}
    />
  );
};

export default TradersTour;
