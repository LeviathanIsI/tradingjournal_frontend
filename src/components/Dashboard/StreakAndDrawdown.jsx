import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  ArrowUpRight,
  Activity,
} from "lucide-react";

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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
          <div className="h-3 w-3 bg-primary/70 rounded-full animate-bounce delay-75"></div>
          <div className="h-3 w-3 bg-primary/40 rounded-full animate-bounce delay-150"></div>
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            Loading stats...
          </span>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-gradient-to-br from-gray-50/90 to-gray-100/80 dark:from-gray-700/30 dark:to-gray-600/20 p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Understanding your performance patterns
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-1.5"></div>
                <span>
                  Monitor both winning and losing streaks to understand trading
                  patterns
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-1.5"></div>
                <span>Track drawdowns to maintain proper risk management</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-1.5"></div>
                <span>
                  Use streak analysis to identify periods of peak performance
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-1.5"></div>
                <span>
                  Compare current performance against historical patterns
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Winning Streaks Section */}
        <div className="space-y-4">
          <h3 className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
            <div className="h-5 w-1 bg-green-500 rounded-full mr-2"></div>
            Winning Streaks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Win Streak
                </h4>
                <TrendingUp
                  className={`h-5 w-5 ${
                    stats.currentStreak > 0 ? "text-green-500" : "text-gray-400"
                  }`}
                />
              </div>
              <div className="mt-4 flex items-baseline">
                <p
                  className={`text-2xl font-bold ${
                    stats.currentStreak > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {stats.currentStreak}
                </p>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  days
                </span>
              </div>
              {stats.currentStreak > 0 && (
                <div className="mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Active streak
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Longest Win Streak
                </h4>
                <Award className="h-5 w-5 text-accent" />
              </div>
              <div className="mt-4 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.longestStreak}
                </p>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  days
                </span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Personal best
                </span>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Win Streak
                </h4>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {typeof stats.averageStreak === "number"
                    ? stats.averageStreak.toFixed(1)
                    : stats.averageStreak}
                </p>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  days
                </span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Long-term average
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawdown Section */}
        <div className="space-y-4">
          <h3 className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100">
            <div className="h-5 w-1 bg-red-500 rounded-full mr-2"></div>
            Drawdown Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Max Consecutive Losses
                </h4>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div className="mt-4 flex items-baseline">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.maxConsecutiveLosses}
                </p>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  trades
                </span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Longest losing sequence
                </span>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Maximum Drawdown
                </h4>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${Math.abs(stats.maxDrawdown).toFixed(2)}
                </p>
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                  {((stats.maxDrawdown / stats.peakEquity) * 100).toFixed(1)}%
                  from peak
                </p>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Status
                </h4>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Peak Equity:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${stats.peakEquity.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Current Equity:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${stats.currentEquity.toFixed(2)}
                  </span>
                </div>
                {stats.currentDrawdown > 0 && (
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-700/40">
                    <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                      Current Drawdown:
                    </span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      ${stats.currentDrawdown.toFixed(2)}
                      <span className="text-xs ml-1">
                        (
                        {(
                          (stats.currentDrawdown / stats.peakEquity) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
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
