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
import getTradeInsights from "../utils/getTradeInsights";

const TradingInsights = ({ trades, stats }) => {
  const insights = getTradeInsights(trades, stats);
  const icons = {
    AlertTriangle,
    Award,
    Target,
    Clock,
    Calendar,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Trading Insights</h3>
        <p className="text-sm text-gray-500">
          Personalized analysis of your trading patterns
        </p>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-gray-500">
          Add more trades to see personalized insights
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = icons[insight.icon];
            return (
              <div
                key={index}
                className={`flex items-start space-x-2 p-4 rounded-lg border
                  ${
                    insight.color === "green"
                      ? "border-green-100 bg-green-50"
                      : insight.color === "yellow"
                      ? "border-yellow-100 bg-yellow-50"
                      : insight.color === "red"
                      ? "border-red-100 bg-red-50"
                      : "border-blue-100 bg-blue-50"
                  }`}
              >
                <Icon
                  className={`h-5 w-5 mt-0.5
                  ${
                    insight.color === "green"
                      ? "text-green-500"
                      : insight.color === "yellow"
                      ? "text-yellow-500"
                      : insight.color === "red"
                      ? "text-red-500"
                      : "text-blue-500"
                  }`}
                />
                <p className="text-sm">{insight.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Overview = ({ trades, stats }) => {
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

  // Format currency consistently
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate win/loss ratio
  const calculateWinLossRatio = () => {
    if (!stats?.winRate || stats.winRate === 0) return 0;
    const ratio = stats.winRate / (100 - stats.winRate);
    return ratio.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Best Winning Streak
            </h3>
            <Award className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{bestStreak}</div>
          <p className="text-xs text-gray-500 mt-1">
            Consecutive winning trades
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Largest Win</h3>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(largestWin)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your best performing trade
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Largest Loss</h3>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(Math.abs(largestLoss))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Your biggest drawdown</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Win/Loss Ratio
            </h3>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{calculateWinLossRatio()}</div>
          <p className="text-xs text-gray-500 mt-1">
            Ratio of winning to losing trades
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-gray-500">Your last 5 trades</p>
        </div>
        <div className="space-y-4">
          {recentTrades.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent trades to display
            </div>
          ) : (
            recentTrades.map((trade) => (
              <div
                key={trade._id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      trade.profitLoss?.realized >= 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{trade.symbol}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(trade.entryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`font-medium ${
                    trade.profitLoss?.realized >= 0
                      ? "text-green-600"
                      : "text-red-600"
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
