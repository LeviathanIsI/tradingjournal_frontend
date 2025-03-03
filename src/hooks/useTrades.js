// src/hooks/useTrades.js
import { useState, useEffect, useMemo } from "react";
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

  // Replace your existing fetchTradeStats function with this one
  const fetchTradeStats = async () => {
    try {
      const [tradeStats, optionTradeStats] = await Promise.all([
        fetchStats("trades"),
        fetchStats("option-trades"),
      ]);

      // Make sure we handle null response cases
      const stockStats = tradeStats || {
        totalTrades: 0,
        profitableTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        totalWinAmount: 0,
        totalLossAmount: 0,
      };
      const optionStats = optionTradeStats || {
        totalTrades: 0,
        profitableTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        totalWinAmount: 0,
        totalLossAmount: 0,
      };

      // Combine stats from both sources
      const mergedStats = {
        totalTrades:
          (stockStats.totalTrades || 0) + (optionStats.totalTrades || 0),
        totalProfit:
          (stockStats.totalProfit || 0) + (optionStats.totalProfit || 0),
        totalWinAmount:
          (stockStats.totalWinAmount || 0) + (optionStats.totalWinAmount || 0),
        totalLossAmount:
          (stockStats.totalLossAmount || 0) +
          (optionStats.totalLossAmount || 0),
        profitableTrades:
          (stockStats.profitableTrades || 0) +
          (optionStats.profitableTrades || 0),
        losingTrades:
          (stockStats.losingTrades || 0) + (optionStats.losingTrades || 0),
      };

      // Calculate combined win rate
      if (mergedStats.totalTrades > 0) {
        mergedStats.winRate =
          (mergedStats.profitableTrades / mergedStats.totalTrades) * 100;
      } else {
        mergedStats.winRate = 0;
      }

      // Calculate combined win/loss ratio
      if (mergedStats.losingTrades > 0) {
        mergedStats.winLossRatio =
          mergedStats.profitableTrades / mergedStats.losingTrades;
      } else {
        mergedStats.winLossRatio =
          mergedStats.profitableTrades > 0 ? mergedStats.profitableTrades : 0;
      }

      setStats(mergedStats);
      return mergedStats;
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      return { totalProfit: 0, totalTrades: 0, winRate: 0, winLossRatio: 0 };
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

  const fetchTradesForWeek = async (weekString) => {
    if (!weekString) return null;

    try {
      // Parse the week string (format: YYYY-W##)
      const [year, weekNum] = weekString.split("-W");

      // Calculate start and end dates for the selected week
      const startDate = getDateOfISOWeek(parseInt(weekNum), parseInt(year));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      // Filter trades that fall within the selected week
      const weekTrades = allTrades.filter((trade) => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= startDate && tradeDate <= endDate;
      });

      return {
        trades: weekTrades,
        weekStart: startDate,
        weekEnd: endDate,
      };
    } catch (error) {
      console.error("Error fetching trades for week:", error);
      return null;
    }
  };

  const getDateOfISOWeek = (week, year) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  };

  const analyzeTradesForWeek = async (weekString) => {
    const weekData = await fetchTradesForWeek(weekString);
    if (!weekData) return null;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const totalTrades = weekData.trades.length;
      const winningTrades = weekData.trades.filter(
        (t) =>
          t.result === "win" ||
          t.pnl > 0 ||
          (t.profitLoss && t.profitLoss.realized > 0)
      ).length;

      const losingTrades = weekData.trades.filter(
        (t) =>
          t.result === "loss" ||
          t.pnl < 0 ||
          (t.profitLoss && t.profitLoss.realized < 0)
      ).length;

      const winRate =
        totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(2) : 0;

      // Calculate total P&L
      const totalPnL = weekData.trades.reduce((sum, trade) => {
        if (trade.pnl) return sum + trade.pnl;
        if (trade.profitLoss && trade.profitLoss.realized)
          return sum + trade.profitLoss.realized;
        return sum;
      }, 0);

      return {
        ...weekData,
        analysis: {
          totalTrades,
          winningTrades,
          losingTrades,
          winRate,
          totalPnL,
        },
      };
    } catch (error) {
      console.error("Error analyzing trades:", error);
      return weekData;
    }
  };

  const allTrades = useMemo(
    () => [...trades.stock, ...trades.options],
    [trades.stock, trades.options]
  );

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
    fetchTradesForWeek,
    analyzeTradesForWeek,
  };
};
