// components/tours/CommunityNavTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import { tourStyles } from "./tourStyles";

const CommunityNavTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: ".community-nav",
      content:
        "Welcome to the Community! This is your hub for connecting with other traders and sharing experiences.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[href="/community/reviews"]',
      content:
        "Trade Reviews: Share and learn from other traders' experiences.",
      placement: "bottom",
    },
    {
      target: '[href="/community/traders"]',
      content: "Traders: Connect with fellow traders and build your network.",
      placement: "bottom",
    },
    {
      target: '[href="/community/leaderboard"]',
      content:
        "Leaderboard: Track top-performing traders and see how you stack up.",
      placement: "bottom",
    },
    {
      target: '[href="/community/featured"]',
      content:
        "Featured: Discover exceptional trade reviews from experienced traders.",
      placement: "bottom",
    },
    {
      target: `[href="/community/profile/${user?.username}"]`,
      content: "Profile: Manage your trading identity and track your progress.",
      placement: "bottom",
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.communityNavTourCompleted) {
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

export default CommunityNavTour;
