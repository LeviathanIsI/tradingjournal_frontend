// src/components/tours/LeaderboardTour.jsx
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
        "Welcome to the Leaderboard! Track top performers and measure your progress.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="leaderboard-overview"]',
      content:
        "See the community's best traders and their performance metrics.",
      placement: "bottom",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="leaderboard-timeframe"]',
      content:
        "Switch between different time periods - daily, weekly, monthly, or all-time rankings.",
      placement: "bottom",
    },
    {
      target: '[data-tour="leaderboard-metrics"]',
      content:
        "Sort by different metrics like total profit, win rate, or number of trades.",
      placement: "bottom",
    },
    {
      target: '[data-tour="top-performers"]',
      content:
        "View the current top traders in different performance categories.",
      placement: "top",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="your-rank"]',
      content:
        "Track your own ranking and see how you compare to other traders.",
      placement: "bottom",
    },
    {
      target: '[data-tour="leaderboard-table"]',
      content:
        "Detailed rankings showing each trader's performance statistics.",
      placement: "top",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="trader-profile-link"]',
      content:
        "Click on any trader to view their detailed profile and trading history.",
      placement: "right",
    },
    {
      target: '[data-tour="rankings-history"]',
      content:
        "Track how rankings change over time and identify consistent performers.",
      placement: "top",
      scrollToSteps: true,
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
