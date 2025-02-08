// src/components/tours/CommunityNavTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { useTour } from "../context/TourContext";
import { tourStyles } from "./tourStyles";

const CommunityNavTour = () => {
  const { user, updateUser } = useAuth();
  const { activeTour, setActiveTour } = useTour();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: ".community-nav",
      content:
        "Welcome to the Community! Here you can connect with other traders and share experiences.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="community-info"]',
      content: "Explore different ways to interact with the trading community.",
      placement: "bottom",
      scrollToSteps: true,
    },
    {
      target: '[href="/community/reviews"]',
      content:
        "Browse and share trade reviews to learn from each other's experiences.",
      placement: "bottom",
    },
    {
      target: '[href="/community/traders"]',
      content: "Find and connect with traders who match your style.",
      placement: "bottom",
    },
    {
      target: '[href="/community/leaderboard"]',
      content: "See top performers and track your ranking among other traders.",
      placement: "bottom",
    },
    {
      target: '[href="/community/featured"]',
      content:
        "Access curated, high-quality trade reviews from experienced traders.",
      placement: "bottom",
    },
    {
      target: `[href="/community/profile/${user?.username}"]`,
      content: "View and manage your trading profile, stats, and network.",
      placement: "bottom",
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.communityNavTourCompleted && !activeTour) {
      setActiveTour("community");
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
          "http://localhost:5000/api/auth/complete-tour/communityNav",
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
            tourStatus: { ...user.tourStatus, communityNavTourCompleted: true },
          });
        }
      } catch (error) {
        console.error("Error completing tour:", error);
      }
      setRunTour(false);
      setActiveTour(null);
    }
  };

  if (activeTour !== "community") return null;

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

export default CommunityNavTour;
