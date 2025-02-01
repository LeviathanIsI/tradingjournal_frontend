// src/components/tours/CommunityTour.jsx
import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";

const CommunityTour = () => {
  const { user, updateUser } = useAuth();
  const [runTour, setRunTour] = useState(false);

  const steps = [
    {
      target: '[data-tour="community-nav"]',
      content: "Navigate through different community features.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="community-reviews"]',
      content:
        "Share and learn from other traders' experiences. See how others analyze their trades and learn from their mistakes.",
      placement: "bottom",
    },
    {
      target: '[data-tour="community-traders"]',
      content:
        "Connect with fellow traders, follow their progress, and build your network.",
      placement: "bottom",
    },
    {
      target: '[data-tour="community-leaderboard"]',
      content:
        "Track top performers and see how you stack up against other traders.",
      placement: "bottom",
    },
    {
      target: '[data-tour="community-featured"]',
      content:
        "Featured trade reviews from our most successful traders - learn from the best!",
      placement: "bottom",
    },
    {
      target: '[data-tour="community-profile"]',
      content: "View your profile and share your trading journey with others.",
      placement: "bottom",
    },
  ];

  useEffect(() => {
    if (user && !user.tourStatus?.communityTourCompleted) {
      setRunTour(true);
    }
  }, [user]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      fetch("http://localhost:5000/api/auth/complete-tour/community", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            updateUser({
              ...user,
              tourStatus: { ...user.tourStatus, communityTourCompleted: true },
            });
          }
        });
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
      spotlightClicks
      disableOverlayClose
      disableCloseOnEsc
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#3B82F6",
          textColor: "#1F2937",
          backgroundColor: "#FFFFFF",
          arrowColor: "#FFFFFF",
          overlayColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    />
  );
};

export default CommunityTour;
