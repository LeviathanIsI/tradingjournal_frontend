// src/hooks/useTradePlans.js
import { useState, useEffect } from "react";

export const useTradePlans = () => {
  const [tradePlans, setTradePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchTradePlans = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/trade-plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trade plans");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching trade plans:", error);
      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/trade-plans/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  };

  const addTradePlan = async (planData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/trade-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        throw new Error("Failed to add trade plan");
      }

      await loadData();
      return true;
    } catch (error) {
      console.error("Error adding trade plan:", error);
      return false;
    }
  };

  const updateTradePlan = async (id, planData) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Updating trade plan with ID:", id);
      console.log("Update data:", planData);

      const response = await fetch(
        `http://localhost:5000/api/trade-plans/${id}`,
        {
          method: "PUT", // Make sure we're using PUT
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(planData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update trade plan");
      }

      await loadData(); // Reload all data after successful update
      return true;
    } catch (error) {
      console.error("Error updating trade plan:", error);
      return false;
    }
  };

  const toggleTradePlanStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/trade-plans/${id}/toggle-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await loadData(); // Refresh the data
      return true;
    } catch (error) {
      console.error("Error toggling trade plan status:", error);
      return false;
    }
  };

  const deleteTradePlan = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/trade-plans/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete trade plan");
      }

      await loadData();
      return true;
    } catch (error) {
      console.error("Error deleting trade plan:", error);
      return false;
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansData, statsData] = await Promise.all([
        fetchTradePlans(),
        fetchStats(),
      ]);
      setTradePlans(plansData);
      setStats(statsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    tradePlans,
    stats,
    loading,
    error,
    addTradePlan,
    updateTradePlan,
    deleteTradePlan,
  };
};
