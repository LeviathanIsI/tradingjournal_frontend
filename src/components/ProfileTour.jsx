// src/components/tours/ProfileTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { tourStyles } from "./tourStyles";

const ProfileTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="profile-content"]',
      content:
        "Welcome to your Trading Profile! Track your progress and manage your trading identity.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="profile-header"]',
      content:
        "Your profile overview including trading style and experience level.",
      placement: "bottom",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="profile-stats"]',
      content: "View your key performance metrics and trading statistics.",
      placement: "bottom",
    },
    {
      target: '[data-tour="profile-bio"]',
      content: "Share your trading journey and strategy with the community.",
      placement: "bottom",
    },
    {
      target: '[data-tour="profile-reviews"]',
      content:
        "Access all your trade reviews and share your trading experiences.",
      placement: "top",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="profile-network"]',
      content:
        "Manage your connections with other traders and see who follows you.",
      placement: "bottom",
    },
    {
      target: '[data-tour="profile-settings"]',
      content: "Customize your profile settings and notification preferences.",
      placement: "left",
    },
    {
      target: '[data-tour="trading-history"]',
      content:
        "Review your complete trading history and performance analytics.",
      placement: "top",
      scrollToSteps: true,
    },
    {
      target: '[data-tour="achievement-badges"]',
      content: "Track your trading achievements and milestones.",
      placement: "bottom",
      scrollToSteps: true,
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.profileTourCompleted) {
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
          "http://localhost:5000/api/auth/complete-tour/profile",
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
            tourStatus: { ...user.tourStatus, profileTourCompleted: true },
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

export default ProfileTour;
