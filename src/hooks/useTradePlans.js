import { useState, useEffect } from "react";

export const useTradePlans = () => {
  const [tradePlans, setTradePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    executedPlans: 0,
    successfulPlans: 0,
    averageRR: 0,
  });

  const fetchTradePlans = async () => {
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
  };

  // Calculate stats from trade plans data
  const calculateStats = (plans) => {
    const totalPlans = plans.length;
    const executedPlans = plans.filter(
      (plan) => plan.status === "EXECUTED"
    ).length;
    const successfulPlans = plans.filter(
      (plan) =>
        plan.status === "EXECUTED" && plan.riskManagement?.rewardRatio > 1
    ).length;

    const avgRR =
      plans.reduce((sum, plan) => {
        return sum + (plan.riskManagement?.rewardRatio || 0);
      }, 0) / totalPlans || 0;

    return {
      totalPlans,
      executedPlans,
      successfulPlans,
      averageRR: avgRR,
    };
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const plansData = await fetchTradePlans();
      setTradePlans(plansData);

      // Calculate stats from the plans data
      const calculatedStats = calculateStats(plansData);
      setStats(calculatedStats);
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add trade plan");
      }

      await loadData();
      return true;
    } catch (error) {
      console.error("Error adding trade plan:", error);
      setError(error.message);
      return false;
    }
  };

  const updateTradePlan = async (id, planData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/trade-plans/${id}`,
        {
          method: "PUT",
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

      await loadData();
      return true;
    } catch (error) {
      console.error("Error updating trade plan:", error);
      setError(error.message);
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete trade plan");
      }

      await loadData();
      return true;
    } catch (error) {
      console.error("Error deleting trade plan:", error);
      setError(error.message);
      return false;
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
