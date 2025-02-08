// src/components/tours/ReviewsTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { tourStyles } from "./tourStyles";

const ReviewsTour = () => {
  const { user, updateUser } = useAuth();
  const { activeTour, setActiveTour } = useTour();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="reviews-content"]',
      content:
        "Browse through trade reviews from the community. Learn from others' experiences and insights.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="reviews-filters"]',
      content:
        "Filter reviews by profit type, date, and other criteria to find the most relevant trades.",
      placement: "bottom",
    },
    {
      target: '[data-tour="reviews-sort"]',
      content:
        "Sort reviews by different metrics like newest, most liked, or highest profit.",
      placement: "bottom",
    },
    {
      target: '[data-tour="reviews-search"]',
      content: "Search for specific traders or review content.",
      placement: "bottom",
    },
    {
      target: '[data-tour="review-card"]',
      content:
        "Each review includes trade details, analysis, and lessons learned.",
      placement: "top",
      scrollToSteps: true,
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.reviewsTourCompleted && !activeTour) {
      setActiveTour("reviews");
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, activeTour]);

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
      setActiveTour(null);
    }
  };

  if (activeTour !== "reviews") return null;

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
