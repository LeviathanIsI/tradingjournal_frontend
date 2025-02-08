// src/components/tours/LeaderboardTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { tourStyles } from "./tourStyles";

const LeaderboardTour = () => {
  const { user, updateUser } = useAuth();
  const { activeTour, startTour, setActiveTour } = useTour();
  const [runTour, setRunTour] = useState(false);
  const [availableSteps, setAvailableSteps] = useState([]);

  const allSteps = [
    {
      target: '[data-tour="leaderboard-content"]',
      content: "Welcome to the Leaderboard! Track top performers and measure your progress.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="leaderboard-timeframe"]',
      content: "Switch between different time periods - daily, weekly, monthly, or all-time rankings.",
      placement: "bottom",
    },
    {
      target: '[data-tour="leaderboard-metrics"]',
      content: "Sort by different metrics like total profit, win rate, or number of trades.",
      placement: "bottom",
    },
    {
      target: '[data-tour="top-performers"]',
      content: "View the current top traders in different performance categories.",
      placement: "top",
      requiresData: true,
    },
    {
      target: '[data-tour="leaderboard-table"]',
      content: "Detailed rankings showing each trader's performance statistics.",
      placement: "top",
      scrollToSteps: true,
      requiresData: true,
    },
  ];

  useEffect(() => {
    const checkTargets = () => {
      const available = allSteps.filter(step => {
        const target = document.querySelector(step.target);
        return !!target;
      });

      if (available.length !== availableSteps.length) {
        setAvailableSteps(available);
      }
    };

    const interval = setInterval(checkTargets, 1000);
    checkTargets();

    return () => clearInterval(interval);
  }, [window.location.pathname]);

  useEffect(() => {
    if (
      user && 
      !user.tourStatus?.leaderboardTourCompleted && 
      !activeTour &&
      window.location.pathname.startsWith('/community/leaderboard') &&
      availableSteps.length > 0
    ) {
      const started = startTour("leaderboard");
      if (started) {
        setRunTour(true);
      }
    }
  }, [user, activeTour, startTour, availableSteps]);

  const handleJoyrideCallback = async (data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/auth/complete-tour/leaderboard",
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
            tourStatus: { ...user.tourStatus, leaderboardTourCompleted: true },
          });
        }
      } catch (error) {
        console.error("Error completing tour:", error);
      }
      setRunTour(false);
      setActiveTour(null);
    }
  };

  if (activeTour !== "leaderboard" || availableSteps.length === 0) return null;

  return (
    <Joyride
      steps={availableSteps}
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

export default LeaderboardTour;
