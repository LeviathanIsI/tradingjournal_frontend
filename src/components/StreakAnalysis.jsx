// src/components/StreakAnalysis.jsx
import { useState, useEffect } from "react";

const StreakAnalysis = ({ trades }) => {
  const [streakStats, setStreakStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreakStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/trades/analysis/streaks",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setStreakStats(data.data);
      } catch (error) {
        console.error("Error fetching streak stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakStats();
  }, [trades]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Winning Streaks
      </h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {streakStats.currentStreak} days
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500">Longest Streak</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {streakStats.longestStreak} days
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Streak</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {streakStats.averageStreak} days
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreakAnalysis;
