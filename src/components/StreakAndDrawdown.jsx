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
          fetch(`${import.meta.env.VITE_API_URL}/api/trades/analysis/streaks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${import.meta.env.VITE_API_URL}/api/trades/analysis/drawdown`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
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

  if (loading)
    return <div className="text-gray-900 dark:text-gray-100">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
        <p className="text-gray-900 dark:text-gray-100">
          Understanding your performance patterns:
        </p>
        <ul className="text-gray-700 dark:text-gray-300 mt-2 space-y-1">
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
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Winning Streaks
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Win Streak
              </h4>
              <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                {stats.currentStreak} days
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Longest Win Streak
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.longestStreak} days
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Win Streak
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.averageStreak} days
              </p>
            </div>
          </div>
        </div>

        {/* Drawdown Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Drawdown Analysis
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Max Consecutive Losses
              </h4>
              <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                {stats.maxConsecutiveLosses} trades
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Maximum Drawdown
              </h4>
              <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                ${Math.abs(stats.maxDrawdown).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {((stats.maxDrawdown / stats.peakEquity) * 100).toFixed(1)}%
                from peak
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Status
              </h4>
              <div className="mt-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Peak Equity:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${stats.peakEquity.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    Current Equity:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${stats.currentEquity.toFixed(2)}
                  </span>
                </div>
                {stats.currentDrawdown > 0 && (
                  <div className="flex justify-between text-sm mt-1 text-red-600 dark:text-red-400">
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
