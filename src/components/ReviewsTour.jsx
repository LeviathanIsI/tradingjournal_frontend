// src/components/tours/ReviewsTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { tourStyles } from "./tourStyles";

const ReviewsTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="reviews-content"]',
      content:
        "Welcome to Trade Reviews! Share and learn from the community's trading experiences.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="reviews-intro"]',
      content:
        "Get insights into different trading strategies and learn from both wins and losses.",
      placement: "bottom",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="reviews-filters"]',
      content:
        "Filter reviews by trade type, profit range, and date to find relevant examples.",
      placement: "bottom",
    },
    {
      target: '[data-tour="reviews-search"]',
      content: "Search for specific symbols, traders, or strategies.",
      placement: "bottom",
    },
    {
      target: '[data-tour="reviews-sort"]',
      content:
        "Sort reviews by different metrics like profit, date, or popularity.",
      placement: "bottom",
    },
    {
      target: '[data-tour="review-card"]',
      content:
        "Each review includes trade details, analysis, and lessons learned.",
      placement: "top",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="review-interactions"]',
      content:
        "Engage with reviews through likes, comments, and save them for future reference.",
      placement: "bottom",
    },
    {
      target: '[data-tour="create-review"]',
      content: "Share your own trade reviews to contribute to the community.",
      placement: "left",
    },
    {
      target: '[data-tour="reviews-stats"]',
      content: "Track review metrics and your contribution to the community.",
      placement: "bottom",
      scrollToSteps: true,
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.reviewsTourCompleted) {
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
          "http://localhost:5000/api/auth/complete-tour/reviews",
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
            tourStatus: { ...user.tourStatus, reviewsTourCompleted: true },
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

export default ReviewsTour;
