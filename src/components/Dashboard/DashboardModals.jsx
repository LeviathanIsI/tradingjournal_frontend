// components/Dashboard/DashboardModals.jsx
import React from "react";
import TradeModal from "./TradeModal";
import OptionTradeModal from "./OptionTradeModal";
import ReviewModal from "../../components/ReviewModal";
import ImportTradeModal from "./ImportTradeModal";

/**
 * Component to manage all dashboard-related modals
 *
 * Centralizes modal management to reduce complexity in the Dashboard component
 */
const DashboardModals = ({
  // Modal states
  isTradeModalOpen,
  selectedTrade,
  isOptionTradeModalOpen,
  selectedOptionTrade,
  isReviewModalOpen,
  selectedTradeForReview,
  isImportModalOpen,

  // Modal control handlers
  onTradeModalClose,
  onOptionTradeModalClose,
  onReviewModalClose,
  onImportModalClose,

  // Action handlers
  onTradeSubmit,
  onOptionTradeSubmit,
  onReviewSubmit,
  onImportTrades,

  // User settings
  userTimeZone,
}) => {
  return (
    <>
      {/* Stock Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={onTradeModalClose}
        onSubmit={onTradeSubmit}
        trade={selectedTrade}
        userTimeZone={userTimeZone}
      />

      {/* Option Trade Modal */}
      <OptionTradeModal
        isOpen={isOptionTradeModalOpen}
        onClose={onOptionTradeModalClose}
        onSubmit={onOptionTradeSubmit}
        trade={selectedOptionTrade}
        userTimeZone={userTimeZone}
      />

      {/* Trade Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={onReviewModalClose}
        trade={selectedTradeForReview}
        onSubmit={onReviewSubmit}
      />

      {/* Import Trades Modal */}
      <ImportTradeModal
        isOpen={isImportModalOpen}
        onClose={onImportModalClose}
        onImport={onImportTrades}
      />
    </>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(DashboardModals);
