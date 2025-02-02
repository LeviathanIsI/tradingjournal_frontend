// components/tours/ProfileTour.jsx
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
        "Welcome to your Profile! This is where you manage your trading identity and track your progress.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: '[data-tour="profile-header"]',
      content:
        "View and edit your profile information, including trading style and bio.",
      placement: "top",
    },
    {
      target: '[data-tour="profile-stats"]',
      content:
        "Track your key performance metrics: total trades, win rate, followers, and following.",
      placement: "bottom",
    },
    {
      target: '[data-tour="profile-tabs"]',
      content:
        "Navigate between your reviews, statistics, network, and settings.",
      placement: "bottom",
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
      disableOverlayClose
      disableCloseOnEsc
      callback={handleJoyrideCallback}
      styles={tourStyles}
    />
  );
};

export default ProfileTour;
