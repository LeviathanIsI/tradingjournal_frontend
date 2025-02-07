import { useState, useEffect } from "react";

const StreakAndDrawdown = ({ trades }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        // Fetch both stats in parallel
        const [streakResponse, drawdownResponse] = await Promise.all([
          fetch("http://localhost:5000/api/trades/analysis/streaks", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/trades/analysis/drawdown", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [streakData, drawdownData] = await Promise.all([
          streakResponse.json(),
          drawdownResponse.json(),
        ]);

        setStats({
          ...streakData.data,
          ...drawdownData.data,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [trades]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Performance Streaks
      </h2>
      <div className="bg-blue-50 p-3 rounded-md mb-6">
        <p className="text-sm text-blue-700">
          Understanding your performance patterns:
        </p>
        <ul className="text-xs text-blue-600 mt-2 space-y-1">
          <li>
            • Monitor both winning and losing streaks to understand trading
            patterns
          </li>
          <li>• Track drawdowns to maintain proper risk management</li>
          <li>• Use streak analysis to identify periods of peak performance</li>
          <li>• Compare current performance against historical patterns</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Winning Streaks Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Winning Streaks</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-500">
                Current Win Streak
              </h4>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                {stats.currentStreak} days
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-500">
                Longest Win Streak
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.longestStreak} days
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-500">
                Average Win Streak
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.averageStreak} days
              </p>
            </div>
          </div>
        </div>

        {/* Drawdown Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">
            Drawdown Analysis
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-500">
                Max Consecutive Losses
              </h4>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                {stats.maxConsecutiveLosses} trades
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-500">
                Maximum Drawdown
              </h4>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                ${Math.abs(stats.maxDrawdown).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {((stats.maxDrawdown / stats.peakEquity) * 100).toFixed(1)}%
                from peak
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-500">
                Current Status
              </h4>
              <div className="mt-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Peak Equity:</span>
                  <span className="font-medium">
                    ${stats.peakEquity.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Current Equity:</span>
                  <span className="font-medium">
                    ${stats.currentEquity.toFixed(2)}
                  </span>
                </div>
                {stats.currentDrawdown > 0 && (
                  <div className="flex justify-between text-sm mt-1 text-red-600">
                    <span>Current Drawdown:</span>
                    <span className="font-medium">
                      ${stats.currentDrawdown.toFixed(2)}(
                      {(
                        (stats.currentDrawdown / stats.peakEquity) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakAndDrawdown;
