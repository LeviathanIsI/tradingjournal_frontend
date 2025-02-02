// components/tours/LeaderboardTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { tourStyles } from "./tourStyles";

const LeaderboardTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="leaderboard-content"]',
      content:
        "Welcome to the Leaderboard! Track the performance of top traders.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="leaderboard-timeframe"]',
      content:
        "Filter rankings by different time periods - today, week, month, or all time.",
      placement: "bottom",
    },
    {
      target: '[data-tour="leaderboard-metrics"]',
      content:
        "Sort traders by different metrics: total profit, win rate, or number of trades.",
      placement: "bottom",
    },
    {
      target: '[data-tour="top-stats"]',
      content:
        "Quick view of the current top performers in different categories.",
      placement: "top",
    },
    {
      target: '[data-tour="leaderboard-table"]',
      content: "Detailed rankings showing each trader's performance metrics.",
      placement: "top",
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.leaderboardTourCompleted) {
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

export default LeaderboardTour;
