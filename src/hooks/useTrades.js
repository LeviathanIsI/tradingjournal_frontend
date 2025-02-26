// src/hooks/useTrades.js
import { useState, useEffect } from "react";
import { fetchStats } from "../utils/fetchStats";

export const useTrades = (user) => {
  const [trades, setTrades] = useState({ stock: [], options: [] });
  const [stats, setStats] = useState({ totalProfit: 0, totalTrades: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Fetch both types of trades in parallel
      const [stockResponse, optionsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/trades`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/option-trades`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!stockResponse.ok || !optionsResponse.ok) {
        throw new Error("Failed to fetch trades");
      }

      const [stockData, optionsData] = await Promise.all([
        stockResponse.json(),
        optionsResponse.json(),
      ]);

      setTrades({
        stock: stockData.data,
        options: optionsData.data,
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching trades:", err);
      setError(err.message);
    }
  };

  const fetchTradeStats = async () => {
    try {
      const [tradeStats, optionTradeStats] = await Promise.all([
        fetchStats("trades"),
        fetchStats("option-trades"),
      ]);

      const mergedStats = {
        totalTrades:
          (tradeStats.totalTrades || 0) + (optionTradeStats.totalTrades || 0),
        totalProfit:
          (tradeStats.totalProfit || 0) + (optionTradeStats.totalProfit || 0),
        totalWinAmount:
          (tradeStats.totalWinAmount || 0) +
          (optionTradeStats.totalWinAmount || 0),
        totalLossAmount:
          (tradeStats.totalLossAmount || 0) +
          (optionTradeStats.totalLossAmount || 0),
      };

      setStats(mergedStats);
      return mergedStats;
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      return { totalProfit: 0, totalTrades: 0 };
    }
  };

  const submitTrade = async (tradeData, existingTrade = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Check if it's a stock trade or option trade
      const isOptionTrade = tradeData.contractType !== undefined;

      // Construct the base endpoint
      let endpoint = isOptionTrade
        ? `${import.meta.env.VITE_API_URL}/api/option-trades`
        : `${import.meta.env.VITE_API_URL}/api/trades`;

      // If editing an existing trade, append the ID to the endpoint
      if (existingTrade && existingTrade._id) {
        endpoint = `${endpoint}/${existingTrade._id}`;
      }

      const method = existingTrade ? "PUT" : "POST"; // If updating, use PUT

      // Make a copy of trade data to avoid modifying the original
      let processedTradeData = { ...tradeData };

      // For option trades, explicitly calculate P/L
      if (
        isOptionTrade &&
        processedTradeData.exitPrice &&
        processedTradeData.exitDate
      ) {
        const contractMultiplier = 100; // Standard for options
        const entryValue =
          processedTradeData.entryPrice *
          processedTradeData.contracts *
          contractMultiplier;
        const exitValue =
          processedTradeData.exitPrice *
          processedTradeData.contracts *
          contractMultiplier;

        // Calculate P/L based on trade type (matching the exact logic from the model)
        let realizedPL = 0;
        if (processedTradeData.type === "LONG") {
          realizedPL = exitValue - entryValue;
        } else {
          realizedPL = entryValue - exitValue;
        }

        // Calculate percentage P/L
        const percentagePL = (realizedPL / entryValue) * 100;

        // Calculate P/L per contract
        const perContractPL = realizedPL / processedTradeData.contracts;

        // Set the complete profitLoss object with all required fields
        processedTradeData.profitLoss = {
          realized: realizedPL,
          percentage: percentagePL,
          perContract: perContractPL,
        };

        // Set status to CLOSED since we have exit data
        processedTradeData.status = "CLOSED";
      } else if (isOptionTrade) {
        // If updating to remove exit data, reset P/L values
        processedTradeData.profitLoss = {
          realized: 0,
          percentage: 0,
          perContract: 0,
        };
        processedTradeData.status = "OPEN";
      }

      // Clean up the data - this is where the error occurs
      const cleanedData = {
        ...processedTradeData,
        strategy: processedTradeData.strategy || undefined,
        setupType: processedTradeData.setupType || undefined,
      };

      // Only handle greeks and marketConditions for option trades
      if (isOptionTrade) {
        // Handle greeks if they exist
        if (processedTradeData.greeksAtEntry) {
          cleanedData.greeksAtEntry = Object.fromEntries(
            Object.entries(processedTradeData.greeksAtEntry || {}).filter(
              ([_, v]) => v !== ""
            )
          );
        }

        if (processedTradeData.greeksAtExit) {
          cleanedData.greeksAtExit = Object.fromEntries(
            Object.entries(processedTradeData.greeksAtExit || {}).filter(
              ([_, v]) => v !== ""
            )
          );
        }

        // Handle marketConditions if they exist
        if (processedTradeData.marketConditions) {
          cleanedData.marketConditions = {
            ...processedTradeData.marketConditions,
            vix: processedTradeData.marketConditions.vix || undefined,
          };
        }
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save trade");
      }

      await Promise.all([fetchTrades(), fetchTradeStats()]);
      return true;
    } catch (error) {
      console.error("Error saving trade:", error);
      return false;
    }
  };

  const deleteTrade = async (tradeId, isOption = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const endpoint = isOption
        ? `${import.meta.env.VITE_API_URL}/api/option-trades/${tradeId}`
        : `${import.meta.env.VITE_API_URL}/api/trades/${tradeId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete trade");
      }

      await Promise.all([fetchTrades(), fetchTradeStats()]);
      return true;
    } catch (err) {
      console.error("Error deleting trade:", err);
      return false;
    }
  };

  // Adding bulkDeleteTrades function that was previously in Dashboard
  const bulkDeleteTrades = async (selectedTradeIds) => {
    if (selectedTradeIds.size === 0)
      return { success: false, error: "No trades selected" };

    try {
      // Categorize trades by type
      const stockTradeIds = [];
      const optionTradeIds = [];
      const allTradesList = [...trades.stock, ...trades.options];

      // Determine which type each selected trade is
      selectedTradeIds.forEach((tradeId) => {
        const trade = allTradesList.find((t) => t._id === tradeId);
        if (trade) {
          if (trade.contractType) {
            optionTradeIds.push(tradeId);
          } else {
            stockTradeIds.push(tradeId);
          }
        }
      });

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Delete stock trades if any
      if (stockTradeIds.length > 0) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trades/bulk-delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              tradeIds: stockTradeIds,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete stock trades");
        }
      }

      // Delete option trades if any
      if (optionTradeIds.length > 0) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/option-trades/bulk-delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              tradeIds: optionTradeIds,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete option trades");
        }
      }

      // Refresh data
      await Promise.all([fetchTrades(), fetchTradeStats()]);
      return { success: true };
    } catch (err) {
      console.error("Bulk delete error:", err);
      return {
        success: false,
        error: err.message || "Failed to delete trades",
      };
    }
  };

  // Add a new function to submit trade reviews
  const submitTradeReview = async (reviewData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reviewData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      return true;
    } catch (error) {
      console.error("Error submitting review:", error);
      return false;
    }
  };

  // Add a function to import trades if needed
  const importTrades = async (tradesToImport) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trades/import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trades: tradesToImport }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import trades");
      }

      await Promise.all([fetchTrades(), fetchTradeStats()]);
      return true;
    } catch (error) {
      console.error("Error importing trades:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchTrades(), fetchTradeStats()]);
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const allTrades = [...trades.stock, ...trades.options];

  return {
    trades: allTrades,
    stockTrades: trades.stock,
    optionTrades: trades.options,
    stats,
    loading,
    error,
    fetchTrades,
    fetchTradeStats,
    submitTrade,
    deleteTrade,
    bulkDeleteTrades,
    submitTradeReview,
    importTrades,
  };
};
