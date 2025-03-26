import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
} from "lucide-react";
import { useTradingStats } from "../../context/TradingStatsContext";

const TradingInsights = ({ trades, stats }) => {
  // Generate insights based on trading data
  const generateInsights = (trades = [], stats = {}) => {
    // Guard clause: need at least some trades and stats data
    if (!trades.length || !stats) {
      return [];
    }

    const insights = [];

    // Normalize stats to avoid undefined values
    const normalizedStats = {
      totalTrades: stats.totalTrades || 0,
      winRate: stats.winRate || 0,
      winLossRatio: stats.winLossRatio || 0,
      totalProfit: stats.totalProfit || 0,
      winningTrades: stats.winningTrades || 0,
      losingTrades: stats.losingTrades || 0,
    };

    // Only generate insights if we have enough trades for meaningful analysis
    if (normalizedStats.totalTrades < 5) {
      insights.push({
        icon: "Clock",
        color: "blue",
        message:
          "Add more trades to unlock deeper insights into your trading patterns.",
      });
      return insights;
    }

    // Win Rate Insights
    if (normalizedStats.winRate >= 65) {
      insights.push({
        icon: "Award",
        color: "green",
        message: `Great job maintaining a ${Math.round(
          normalizedStats.winRate
        )}% win rate! Your strategy is working well.`,
      });
    } else if (
      normalizedStats.winRate < 40 &&
      normalizedStats.totalTrades >= 10
    ) {
      insights.push({
        icon: "AlertTriangle",
        color: "red",
        message: `Your win rate of ${Math.round(
          normalizedStats.winRate
        )}% is below average. Consider reviewing your entry criteria.`,
      });
    }

    // Win/Loss Ratio Insights
    if (normalizedStats.winLossRatio >= 2) {
      insights.push({
        icon: "Target",
        color: "green",
        message: `Your win/loss ratio of ${normalizedStats.winLossRatio.toFixed(
          2
        )} shows you're maximizing profitable trades.`,
      });
    } else if (
      normalizedStats.winLossRatio < 1 &&
      normalizedStats.totalTrades >= 10
    ) {
      insights.push({
        icon: "AlertTriangle",
        color: "yellow",
        message: `Your winners aren't compensating for your losers. Consider adjusting your position sizing.`,
      });
    }

    // Trading Consistency
    if (trades.length >= 10) {
      // Check trading frequency and consistency
      const lastTenTrades = trades.slice(0, 10);

      // Sort trades by entry date
      const sortedTrades = [...lastTenTrades].sort(
        (a, b) => new Date(a.entryDate) - new Date(b.entryDate)
      );

      // Calculate days between trades
      const tradingDays = [];
      for (let i = 1; i < sortedTrades.length; i++) {
        const currentDate = new Date(sortedTrades[i].entryDate);
        const previousDate = new Date(sortedTrades[i - 1].entryDate);
        const daysBetween = Math.round(
          (currentDate - previousDate) / (1000 * 60 * 60 * 24)
        );
        tradingDays.push(daysBetween);
      }

      // Calculate standard deviation to measure consistency
      const avgDays =
        tradingDays.reduce((sum, days) => sum + days, 0) / tradingDays.length;
      const variance =
        tradingDays.reduce(
          (sum, days) => sum + Math.pow(days - avgDays, 2),
          0
        ) / tradingDays.length;
      const stdDev = Math.sqrt(variance);

      // Check position sizing consistency
      const positions = lastTenTrades.map(
        (trade) => trade.quantity * (trade.entryPrice || 0)
      );
      const avgPosition =
        positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
      const positionVariance =
        positions.reduce(
          (sum, pos) => sum + Math.pow(pos - avgPosition, 2),
          0
        ) / positions.length;
      const positionStdDev = Math.sqrt(positionVariance);
      const positionConsistency = positionStdDev / avgPosition;

      // Determine if trading is consistent based on time between trades and position sizing
      const isTimeConsistent = stdDev < avgDays * 0.5;
      const isSizeConsistent = positionConsistency < 0.3;
      const isConsistent = isTimeConsistent && isSizeConsistent;

      if (isConsistent) {
        insights.push({
          icon: "Calendar",
          color: "green",
          message:
            "You're trading consistently in both timing and position sizing. This discipline will benefit you long-term.",
        });
      } else if (isTimeConsistent) {
        insights.push({
          icon: "Calendar",
          color: "yellow",
          message:
            "You trade at regular intervals, but your position sizing varies significantly. Consider standardizing your approach.",
        });
      } else if (isSizeConsistent) {
        insights.push({
          icon: "AlertTriangle",
          color: "yellow",
          message:
            "Your position sizing is consistent, but your trading schedule is irregular. A consistent routine may improve results.",
        });
      } else {
        insights.push({
          icon: "AlertTriangle",
          color: "yellow",
          message:
            "Your trading lacks consistency in timing and position sizing. A more structured approach might improve your results.",
        });
      }
    }

    // Consecutive Losses Warning
    let maxConsecutiveLosses = 0;
    let currentConsecutiveLosses = 0;

    for (const trade of trades) {
      if ((trade.profitLoss?.realized || 0) < 0) {
        currentConsecutiveLosses++;
        maxConsecutiveLosses = Math.max(
          maxConsecutiveLosses,
          currentConsecutiveLosses
        );
      } else {
        currentConsecutiveLosses = 0;
      }
    }

    if (maxConsecutiveLosses >= 3) {
      insights.push({
        icon: "AlertTriangle",
        color: "red",
        message: `Be careful - you've had ${maxConsecutiveLosses} consecutive losing trades recently.`,
      });
    }

    // Limit to 4 insights maximum for UI space constraints
    return insights.slice(0, 4);
  };

  const insights = generateInsights(trades, stats);
  const icons = {
    AlertTriangle,
    Award,
    Target,
    Clock,
    Calendar,
  };

  return (
    <div className="bg-white dark:bg-gray-800/80 p-4 sm:p-6 round-sm border border-gray-200 dark:border-gray-700/60 shadow-md">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">
          Trading Insights
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Personalized analysis of your trading patterns
        </p>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add more trades to see personalized insights
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {insights.map((insight, index) => {
            const Icon = icons[insight.icon];
            return (
              <div
                key={index}
                className={`flex items-start space-x-2 p-3 sm:p-4 round-sm transition-shadow duration-200 hover:shadow-md
                ${
                  insight.color === "green"
                    ? "border border-green-200 dark:border-green-700/40 bg-green-50 dark:bg-green-700/20"
                    : insight.color === "yellow"
                    ? "border border-yellow-200 dark:border-yellow-700/40 bg-yellow-50 dark:bg-yellow-700/20"
                    : insight.color === "red"
                    ? "border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-700/20"
                    : "border border-blue-200 dark:border-blue-700/40 bg-blue-50 dark:bg-blue-700/20"
                }`}
              >
                <Icon
                  className={`h-5 w-5 mt-0.5 flex-shrink-0
                ${
                  insight.color === "green"
                    ? "text-green-500 dark:text-green-400"
                    : insight.color === "yellow"
                    ? "text-yellow-500 dark:text-yellow-400"
                    : insight.color === "red"
                    ? "text-red-500 dark:text-red-400"
                    : "text-blue-500 dark:text-blue-400"
                }`}
                />
                <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  {insight.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Overview = ({ trades }) => {
  // Use the trading stats context
  const { stats, formatters } = useTradingStats();
  const { formatCurrency, formatPercent, formatRatio } = formatters || {
    formatCurrency: (value) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    },
    formatPercent: (value) => `${value.toFixed(1)}%`,
    formatRatio: (value) => value.toFixed(2),
  };

  // Calculate best winning streak
  const calculateBestStreak = (trades) => {
    let currentStreak = 0;
    let maxStreak = 0;

    trades?.forEach((trade) => {
      if (trade.profitLoss?.realized > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  };

  // Get last 5 trades in reverse chronological order
  const recentTrades = trades?.slice(0, 5) || [];
  const bestStreak = calculateBestStreak(trades);

  // Calculate largest win/loss
  const largestWin =
    trades?.reduce((max, trade) => {
      const profit = trade.profitLoss?.realized || 0;
      return profit > max ? profit : max;
    }, 0) || 0;

  const largestLoss =
    trades?.reduce((min, trade) => {
      const loss = trade.profitLoss?.realized || 0;
      return loss < min ? loss : min;
    }, 0) || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Best Winning Streak
            </h3>
            <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            {bestStreak}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Consecutive wins
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Largest Win
            </h3>
            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(largestWin)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Best trade
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Largest Loss
            </h3>
            <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(Math.abs(largestLoss))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Biggest loss
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Win/Loss Ratio
            </h3>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            {stats ? formatRatio(stats.winLossRatio) : "0.00"}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Win/Loss ratio
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800/80 p-3 sm:p-4 round-sm border border-gray-200 dark:border-gray-700/60 shadow-md">
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">
            Recent Activity
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Your last 5 trades
          </p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {recentTrades.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No recent trades to display
            </div>
          ) : (
            recentTrades.map((trade) => (
              <div
                key={trade._id}
                className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/40 pb-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      trade.profitLoss?.realized >= 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-50">
                      {trade.symbol}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {new Date(trade.entryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm sm:text-base font-medium ${
                    trade.profitLoss?.realized >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(trade.profitLoss?.realized || 0)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trading Insights */}
      <TradingInsights trades={trades} stats={stats} />
    </div>
  );
};

export default Overview;
