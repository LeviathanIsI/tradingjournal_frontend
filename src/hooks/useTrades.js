// src/hooks/useTrades.js
import { useState, useEffect } from "react";

export const useTrades = () => {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:5000/api/trades", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch trades");
      }

      const data = await response.json();
      setTrades(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching trades:", err);
      setError(err.message);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:5000/api/trades/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err.message);
    }
  };

  const addTrade = async (tradeData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:5000/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add trade");
      }

      // Refresh both trades and stats after successful addition
      await Promise.all([fetchTrades(), fetchStats()]);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error adding trade:", err);
      setError(err.message);
      return false;
    }
  };

  const updateTrade = async (tradeId, tradeData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5000/api/trades/${tradeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(tradeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update trade");
      }

      // Refresh both trades and stats after successful update
      await Promise.all([fetchTrades(), fetchStats()]);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error updating trade:", err);
      setError(err.message);
      return false;
    }
  };

  const deleteTrade = async (tradeId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5000/api/trades/${tradeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete trade");
      }

      // Refresh both trades and stats after successful deletion
      await Promise.all([fetchTrades(), fetchStats()]);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error deleting trade:", err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchTrades(), fetchStats()]);
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    trades,
    stats,
    loading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    fetchTrades,
    fetchStats,
  };
};
