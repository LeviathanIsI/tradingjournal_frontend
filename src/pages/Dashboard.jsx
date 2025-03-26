import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTrades } from "../hooks/useTrades";
import { generateWelcomeMessage } from "../utils/welcomeMessages";
import { useTradingStats } from "../context/TradingStatsContext";

// Dashboard components
import DashboardNav from "../components/Dashboard/DashboardNav";
import {
  DashboardStats,
  DashboardRoutes,
  DashboardModals,
} from "../components/Dashboard";

// Custom hooks
import useModalState from "../hooks/Dashboard/useModalState.js";
import useUIState from "../hooks/Dashboard/useUIState.js";
import useDashboardEffects from "../hooks/Dashboard/useDashboardEffects.js";

// Utility functions
import { formatCurrency } from "../components/Dashboard/utils/formatters";

// Constellation Background Effect
const BackgroundEffect = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef(null);
  const starsRef = useRef([]);
  const connectionsRef = useRef([]);
  const lastConnectionTimeRef = useRef(0);

  // Set up resize listener
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate initial stars
  useEffect(() => {
    if (dimensions.width === 0) return;

    // Create 30-50 stars based on screen size
    const starCount = Math.floor(
      (dimensions.width * dimensions.height) / 40000
    );
    const stars = Array.from(
      { length: Math.min(50, Math.max(30, starCount)) },
      () => ({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 1.2 + 0.3, // 0.3px to 1.5px
        opacity: Math.random() * 0.15 + 0.05, // Very subtle: 0.05 to 0.2
        twinkle: {
          active: Math.random() > 0.7, // 30% of stars twinkle
          speed: Math.random() * 0.01 + 0.005,
          min: 0.03,
          max: 0.15,
          direction: 1,
        },
      })
    );

    starsRef.current = stars;
  }, [dimensions]);

  // Create occasional connections between stars
  useEffect(() => {
    const attemptConnection = () => {
      const now = Date.now();
      // Only try to create connections every 3-10 seconds
      if (now - lastConnectionTimeRef.current < 3000 + Math.random() * 7000)
        return;

      // Small chance to create a connection
      if (Math.random() > 0.3 || starsRef.current.length < 2) return;

      // Select two random stars that aren't too far apart
      const stars = starsRef.current;
      let attempts = 0;
      let validPair = false;
      let star1, star2;

      while (!validPair && attempts < 10) {
        attempts++;
        const i = Math.floor(Math.random() * stars.length);
        const j = Math.floor(Math.random() * stars.length);

        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(stars[i].x - stars[j].x, 2) +
              Math.pow(stars[i].y - stars[j].y, 2)
          );

          // Only connect stars that are somewhat close but not too close
          if (distance > 100 && distance < 300) {
            star1 = stars[i];
            star2 = stars[j];
            validPair = true;
          }
        }
      }

      if (validPair) {
        const duration = 2000 + Math.random() * 3000; // 2-5 seconds
        const connection = {
          x1: star1.x,
          y1: star1.y,
          x2: star2.x,
          y2: star2.y,
          progress: 0,
          duration: duration,
          opacity: Math.random() * 0.08 + 0.02, // Very subtle: 0.02 to 0.1
          timestamp: now,
        };

        connectionsRef.current.push(connection);
        lastConnectionTimeRef.current = now;
      }
    };

    // Check for new connections periodically
    const connectionInterval = setInterval(attemptConnection, 1000);

    return () => clearInterval(connectionInterval);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ensure canvas is properly sized
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const animate = () => {
      // Clear canvas with transparent fill
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      starsRef.current.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        // Update twinkle effect
        if (star.twinkle.active) {
          star.opacity += star.twinkle.speed * star.twinkle.direction;
          if (star.opacity > star.twinkle.max) {
            star.opacity = star.twinkle.max;
            star.twinkle.direction = -1;
          } else if (star.opacity < star.twinkle.min) {
            star.opacity = star.twinkle.min;
            star.twinkle.direction = 1;
          }
        }

        // Draw star
        ctx.fillStyle = `rgba(59, 130, 246, ${star.opacity})`;
        ctx.fill();
      });

      // Update and draw connections
      const now = Date.now();
      connectionsRef.current = connectionsRef.current.filter((conn) => {
        const elapsed = now - conn.timestamp;
        conn.progress = Math.min(1, elapsed / conn.duration);

        if (conn.progress < 1) {
          // Draw connection line with progress
          const length = Math.sqrt(
            Math.pow(conn.x2 - conn.x1, 2) + Math.pow(conn.y2 - conn.y1, 2)
          );

          const angle = Math.atan2(conn.y2 - conn.y1, conn.x2 - conn.x1);
          const targetX = conn.x1 + Math.cos(angle) * length * conn.progress;
          const targetY = conn.y1 + Math.sin(angle) * length * conn.progress;

          // Draw line
          ctx.beginPath();
          ctx.moveTo(conn.x1, conn.y1);
          ctx.lineTo(targetX, targetY);

          // Fade in, then fade out
          let opacity = conn.opacity;
          if (conn.progress < 0.2) {
            opacity = conn.opacity * (conn.progress / 0.2);
          } else if (conn.progress > 0.8) {
            opacity = conn.opacity * (1 - (conn.progress - 0.8) / 0.2);
          }

          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          return true;
        }
        return false;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};

/**
 * Main Dashboard page component - now significantly leaner
 * with logic extracted to custom hooks and subcomponents
 */
const Dashboard = () => {
  // Get user data and auth state
  const {
    user,
    checkSubscriptionStatus,
    loading: authLoading,
    subscription,
  } = useAuth();
  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
  const { refreshData } = useTradingStats();

  const { showToast } = useToast();

  // Dashboard UI state hook
  const {
    selectedTrades,
    hasSelectedTrades,
    activeChart,
    setActiveChart,
    bulkDeleteError,
    isDeleting,
    setBulkDeleteStatus,
    handleSelectTrade,
    handleSelectAll,
    clearSelectedTrades,
  } = useUIState();

  // Modal management hook
  const {
    isTradeModalOpen,
    selectedTrade,
    isOptionTradeModalOpen,
    selectedOptionTrade,
    isReviewModalOpen,
    selectedTradeForReview,
    isImportModalOpen,
    openTradeModal,
    openOptionTradeModal,
    openReviewModal,
    openImportModal,
    closeTradeModal,
    closeOptionTradeModal,
    closeReviewModal,
    closeImportModal,
    handleEditClick,
  } = useModalState();

  // Dashboard effects hook
  const { isLoading, setIsLoading } = useDashboardEffects(
    checkSubscriptionStatus,
    user
  );

  // Get trades and trade functions from the hook
  const {
    trades: allTrades,
    stats,
    error: tradesError,
    loading: tradesLoading,
    deleteTrade,
    submitTrade,
    bulkDeleteTrades,
    submitTradeReview,
    importTrades,
    fetchTradesForWeek,
    analyzeTradesForWeek,
  } = useTrades(user);

  // Set up user timezone from preferences
  const userTimeZone = user?.preferences?.timeZone || "UTC";

  useEffect(() => {
    // Read the flag from sessionStorage
    const shouldShowWelcome = sessionStorage.getItem("showWelcome") === "true";

    // Clear the flag immediately to prevent showing on refresh
    if (shouldShowWelcome) {
      sessionStorage.removeItem("showWelcome");
    }

    // Only show if flag was true and we haven't shown it yet
    if (shouldShowWelcome && !welcomeMessageShown && user) {
      // Add a delay to ensure dashboard is visible first
      const timer = setTimeout(() => {
        try {
          const timezone = user.preferences?.timeZone || "UTC";
          const welcomeMessage = generateWelcomeMessage(
            user.username,
            timezone
          );
          showToast(welcomeMessage, "welcome", false);
          setWelcomeMessageShown(true);
        } catch (e) {
          console.error("Error showing welcome message:", e);
        }
      }, 1000); // Increased delay for reliability

      return () => clearTimeout(timer);
    }
  }, [user, welcomeMessageShown, showToast]);

  // Handler for deleting a single trade
  const handleDeleteClick = async (trade) => {
    if (!trade || !trade._id) {
      console.error("❌ Trade or Trade ID is missing!");
      return;
    }

    const isOptionTrade = trade.contractType !== undefined;

    if (
      window.confirm(
        `Are you sure you want to delete this ${
          isOptionTrade ? "option" : "regular"
        } trade?`
      )
    ) {
      const success = await deleteTrade(trade._id, isOptionTrade);

      if (success) {
        showToast("Trade deleted successfully", "success");
        // Add this line to refresh stats after successful deletion
        setTimeout(() => refreshData(), 300);
      } else {
        showToast(
          `Failed to delete ${isOptionTrade ? "option" : "regular"} trade`,
          "error"
        );
      }
    }
  };

  // Handler for bulk deleting trades
  // Handler for bulk deleting trades
  const handleBulkDelete = async () => {
    if (selectedTrades.size === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedTrades.size} trades?`
      )
    ) {
      return;
    }

    setBulkDeleteStatus(true, null);

    const result = await bulkDeleteTrades(selectedTrades);

    if (result.success) {
      clearSelectedTrades();
      showToast(
        `Successfully deleted ${selectedTrades.size} trades`,
        "success"
      );
      // Add this line to refresh stats after successful bulk deletion
      setTimeout(() => refreshData(), 300);
    } else {
      setBulkDeleteStatus(
        false,
        result.error || "Failed to delete trades. Please try again."
      );
    }

    setBulkDeleteStatus(false, null);
  };

  // Handler for submitting a trade
  const handleTradeSubmit = async (tradeData) => {
    try {
      const success = await submitTrade(tradeData, selectedTrade);

      if (success) {
        closeTradeModal();
        showToast("Trade saved successfully", "success");
      } else {
        showToast("Failed to save trade", "error");
      }
    } catch (error) {
      console.error("Error saving trade:", error);
      showToast(error.message || "Failed to save trade", "error");
    }
  };

  // Handler for submitting an option trade
  const handleOptionTradeSubmit = async (tradeData) => {
    try {
      const success = await submitTrade(tradeData, selectedOptionTrade);

      if (success) {
        closeOptionTradeModal();
        showToast("Option trade saved successfully", "success");
      } else {
        showToast("Failed to save option trade", "error");
      }
    } catch (error) {
      console.error("Error saving option trade:", error);
      showToast(error.message || "Failed to save option trade", "error");
    }
  };

  // Handler for submitting a trade review
  const handleReviewSubmit = async (reviewData) => {
    const success = await submitTradeReview(reviewData);

    if (success) {
      closeReviewModal();
      showToast("Review submitted successfully", "success");
    } else {
      showToast("Failed to submit review", "error");
    }
  };

  // Handler for importing trades
  const handleImportTrades = async (trades) => {
    const success = await importTrades(trades);

    if (success) {
      closeImportModal();
      showToast("Trades imported successfully", "success");
    } else {
      showToast("Failed to import trades", "error");
    }
  };

  // Loading state
  if (authLoading || isLoading || tradesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-lg text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  // Error state
  if (tradesError) {
    return (
      <div className="w-full min-h-screen pt-16 px-3 sm:px-6 py-3 sm:py-6 flex items-center justify-center text-red-600 dark:text-red-400 bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 round-sm border border-red-100 dark:border-red-800/50 shadow-sm">
          Error: {tradesError}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <BackgroundEffect />

      {/* Navigation */}
      <DashboardNav />

      {/* Stats Overview */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 mt-4 bg-transparent relative z-10">
        <DashboardStats user={user} stats={stats} />
      </div>

      {/* Main Content with Routes */}
      <div className="flex-1 relative z-10">
        <DashboardRoutes
          user={user}
          trades={allTrades}
          stats={stats}
          activeChart={activeChart}
          setActiveChart={setActiveChart}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onSelectTrade={handleSelectTrade}
          onSelectAll={handleSelectAll}
          onBulkDelete={handleBulkDelete}
          onAddTradeClick={() => openTradeModal()}
          onAddOptionTradeClick={() => openOptionTradeModal()}
          onOpenReviewModal={openReviewModal}
          selectedTrades={selectedTrades}
          isDeleting={isDeleting}
          bulkDeleteError={bulkDeleteError}
          setBulkDeleteError={(error) => setBulkDeleteStatus(isDeleting, error)}
          fetchTradesForWeek={fetchTradesForWeek}
          analyzeTradesForWeek={analyzeTradesForWeek}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Modals */}
      <DashboardModals
        isTradeModalOpen={isTradeModalOpen}
        selectedTrade={selectedTrade}
        isOptionTradeModalOpen={isOptionTradeModalOpen}
        selectedOptionTrade={selectedOptionTrade}
        isReviewModalOpen={isReviewModalOpen}
        selectedTradeForReview={selectedTradeForReview}
        isImportModalOpen={isImportModalOpen}
        onTradeModalClose={closeTradeModal}
        onOptionTradeModalClose={closeOptionTradeModal}
        onReviewModalClose={closeReviewModal}
        onImportModalClose={closeImportModal}
        onTradeSubmit={handleTradeSubmit}
        onOptionTradeSubmit={handleOptionTradeSubmit}
        onReviewSubmit={handleReviewSubmit}
        onImportTrades={handleImportTrades}
        userTimeZone={userTimeZone}
      />
    </div>
  );
};

export default Dashboard;
