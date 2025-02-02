// components/tours/FeaturedTour.jsx
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
        "Welcome to Featured Reviews! Here you'll find the most insightful and educational trade reviews.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="featured-header"]',
      content:
        "These reviews are selected daily based on quality and educational value.",
      placement: "bottom",
    },
    {
      target: '[data-tour="featured-review"]',
      content:
        "Each featured review provides detailed analysis and valuable trading lessons.",
      placement: "top",
    },
    {
      target: '[data-tour="review-interactions"]',
      content:
        "Engage with reviews through likes and comments to discuss insights with other traders.",
      placement: "top",
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
      disableOverlayClose
      disableCloseOnEsc
      callback={handleJoyrideCallback}
      styles={tourStyles}
    />
  );
};

export default FeaturedTour;
