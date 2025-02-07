// src/components/tours/FeaturedTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { tourStyles } from "./tourStyles";

const FeaturedTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="featured-content"]',
      content:
        "Welcome to Featured Reviews! Find the most insightful trade breakdowns from experienced traders.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="featured-intro"]',
      content:
        "Discover high-quality trade reviews selected for their educational value.",
      placement: "bottom",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="featured-filters"]',
      content:
        "Filter featured content by trading style, profit range, or market conditions.",
      placement: "bottom",
    },
    {
      target: '[data-tour="featured-categories"]',
      content:
        "Browse reviews by category - strategy breakdowns, risk management, or psychology lessons.",
      placement: "right",
    },
    {
      target: '[data-tour="featured-review"]',
      content:
        "Each featured review provides detailed analysis and key trading lessons.",
      placement: "top",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="review-metrics"]',
      content: "See why this review was featured and what makes it valuable.",
      placement: "bottom",
    },
    {
      target: '[data-tour="review-interactions"]',
      content: "Engage with reviews through likes, comments, and bookmarks.",
      placement: "left",
    },
    {
      target: '[data-tour="featured-trader"]',
      content: "Learn about the featured trader and their trading style.",
      placement: "right",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="featured-archives"]',
      content:
        "Access previously featured reviews organized by date and category.",
      placement: "top",
      scrollToSteps: true,
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.featuredTourCompleted) {
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
          "http://localhost:5000/api/auth/complete-tour/featured",
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
            tourStatus: { ...user.tourStatus, featuredTourCompleted: true },
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

export default FeaturedTour;
