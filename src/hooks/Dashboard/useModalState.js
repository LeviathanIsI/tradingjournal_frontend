// hooks/Dashboard/useModalState.js
import { useState, useCallback } from "react";

/**
 * Custom hook for managing all trade-related modals
 *
 * Centralizes modal states and handlers to simplify Dashboard component
 */
const useModalState = () => {
  // Trade modal state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);

  // Option trade modal state
  const [isOptionTradeModalOpen, setIsOptionTradeModalOpen] = useState(false);
  const [selectedOptionTrade, setSelectedOptionTrade] = useState(null);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTradeForReview, setSelectedTradeForReview] = useState(null);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  /**
   * Open trade modal with optional trade data for editing
   */
  const openTradeModal = useCallback((trade = null) => {
    setSelectedTrade(trade);
    setIsTradeModalOpen(true);
  }, []);

  /**
   * Close trade modal and reset selected trade
   */
  const closeTradeModal = useCallback(() => {
    setIsTradeModalOpen(false);
    // Don't reset selectedTrade immediately to avoid UI flickers during animation
    setTimeout(() => setSelectedTrade(null), 300);
  }, []);

  /**
   * Open option trade modal with optional trade data for editing
   */
  const openOptionTradeModal = useCallback((trade = null) => {
    setSelectedOptionTrade(trade);
    setIsOptionTradeModalOpen(true);
  }, []);

  /**
   * Close option trade modal and reset selected option trade
   */
  const closeOptionTradeModal = useCallback(() => {
    setIsOptionTradeModalOpen(false);
    // Don't reset selectedOptionTrade immediately to avoid UI flickers during animation
    setTimeout(() => setSelectedOptionTrade(null), 300);
  }, []);

  /**
   * Open review modal with specified trade data
   */
  const openReviewModal = useCallback((trade) => {
    if (!trade) return;
    setSelectedTradeForReview(trade);
    setIsReviewModalOpen(true);
  }, []);

  /**
   * Close review modal and reset selected trade for review
   */
  const closeReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    // Don't reset selectedTradeForReview immediately to avoid UI flickers during animation
    setTimeout(() => setSelectedTradeForReview(null), 300);
  }, []);

  /**
   * Open import trades modal
   */
  const openImportModal = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  /**
   * Close import trades modal
   */
  const closeImportModal = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  /**
   * Handle editing trade (determines which modal to open based on trade type)
   */
  const handleEditClick = useCallback(
    (trade) => {
      if (!trade) return;

      if (trade.contractType) {
        openOptionTradeModal(trade);
      } else {
        openTradeModal(trade);
      }
    },
    [openOptionTradeModal, openTradeModal]
  );

  return {
    // Modal states
    isTradeModalOpen,
    selectedTrade,
    isOptionTradeModalOpen,
    selectedOptionTrade,
    isReviewModalOpen,
    selectedTradeForReview,
    isImportModalOpen,

    // Open modal handlers
    openTradeModal,
    openOptionTradeModal,
    openReviewModal,
    openImportModal,

    // Close modal handlers
    closeTradeModal,
    closeOptionTradeModal,
    closeReviewModal,
    closeImportModal,

    // Utility handlers
    handleEditClick,
  };
};

export default useModalState;
