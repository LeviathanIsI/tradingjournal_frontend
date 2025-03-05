// hooks/Dashboard/useUIState.js
import { useState, useCallback, useMemo } from "react";

/**
 * Custom hook for managing Dashboard UI state
 *
 * Handles:
 * - Trade selection (single and bulk)
 * - Active chart/tab selection
 * - Bulk delete operations state
 */
const useUIState = (allTrades = []) => {
  // Selected trades for bulk operations
  const [selectedTrades, setSelectedTrades] = useState(new Set());

  // Active chart/visualization
  const [activeChart, setActiveChart] = useState("pnl");

  // Bulk delete operation state
  const [bulkDeleteError, setBulkDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Toggle selection state for a single trade
   */
  const handleSelectTrade = useCallback((tradeId) => {
    setSelectedTrades((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(tradeId)) {
        newSelected.delete(tradeId);
      } else {
        newSelected.add(tradeId);
      }
      return newSelected;
    });
  }, []);

  /**
   * Toggle selection state for all trades in the current view
   */
  const handleSelectAll = useCallback((currentTrades) => {
    setSelectedTrades((prev) => {
      const newSelected = new Set(prev);

      // Check if all visible trades are already selected
      const areAllSelected = currentTrades.every((trade) =>
        prev.has(trade._id)
      );

      if (areAllSelected) {
        // Deselect all visible trades
        currentTrades.forEach((trade) => newSelected.delete(trade._id));
      } else {
        // Select all visible trades
        currentTrades.forEach((trade) => newSelected.add(trade._id));
      }

      return newSelected;
    });
  }, []);

  /**
   * Clear all selected trades
   */
  const clearSelectedTrades = useCallback(() => {
    setSelectedTrades(new Set());
  }, []);

  /**
   * Computed property to check if any trades are selected
   */
  const hasSelectedTrades = useMemo(
    () => selectedTrades.size > 0,
    [selectedTrades]
  );

  /**
   * Set bulk delete operation status
   */
  const setBulkDeleteStatus = useCallback((isActive, error = null) => {
    setIsDeleting(isActive);
    setBulkDeleteError(error);
  }, []);

  return {
    // Selection state
    selectedTrades,
    hasSelectedTrades,

    // Chart state
    activeChart,
    setActiveChart,

    // Bulk delete state
    bulkDeleteError,
    isDeleting,
    setBulkDeleteStatus,

    // Selection handlers
    handleSelectTrade,
    handleSelectAll,
    clearSelectedTrades,
  };
};

export default useUIState;
