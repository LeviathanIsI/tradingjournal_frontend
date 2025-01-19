import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TimeAnalysis = ({ trades }) => {
  const [selectedSession, setSelectedSession] = useState("all");

  const timeAnalysis = useMemo(() => {
    // Group trades by hour
    const hourlyData = {};
    trades.forEach((trade) => {
      if (trade.status !== "CLOSED") return;

      const hour = new Date(trade.entryDate).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          hour,
          totalTrades: 0,
          winningTrades: 0,
          totalProfit: 0,
          session: trade.session,
        };
      }

      hourlyData[hour].totalTrades++;
      if (trade.profitLoss.realized > 0) {
        hourlyData[hour].winningTrades++;
      }
      hourlyData[hour].totalProfit += trade.profitLoss.realized;
    });

    return Object.values(hourlyData)
      .map((data) => ({
        ...data,
        winRate: (data.winningTrades / data.totalTrades) * 100,
        avgProfit: data.totalProfit / data.totalTrades,
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [trades]);

  const sessionStats = useMemo(() => {
    const stats = {
      "Pre-Market": { totalTrades: 0, winningTrades: 0, totalProfit: 0 },
      Regular: { totalTrades: 0, winningTrades: 0, totalProfit: 0 },
      "After-Hours": { totalTrades: 0, winningTrades: 0, totalProfit: 0 },
    };

    trades.forEach((trade) => {
      if (trade.status !== "CLOSED") return;

      const sessionData = stats[trade.session];
      sessionData.totalTrades++;
      if (trade.profitLoss.realized > 0) {
        sessionData.winningTrades++;
      }
      sessionData.totalProfit += trade.profitLoss.realized;
    });

    // Calculate percentages and averages
    Object.keys(stats).forEach((session) => {
      const data = stats[session];
      data.winRate = data.totalTrades
        ? (data.winningTrades / data.totalTrades) * 100
        : 0;
      data.avgProfit = data.totalTrades
        ? data.totalProfit / data.totalTrades
        : 0;
    });

    return stats;
  }, [trades]);

  const filteredTimeData =
    selectedSession === "all"
      ? timeAnalysis
      : timeAnalysis.filter((data) => data.session === selectedSession);

  return (
    <div className="space-y-6">
      {/* Session Overview */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(sessionStats).map(([session, stats]) => (
          <div
            key={session}
            onClick={() =>
              setSelectedSession(session === selectedSession ? "all" : session)
            }
            className={`p-4 rounded-lg border cursor-pointer transition-colors
              ${
                session === selectedSession
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
          >
            <h3 className="text-lg font-medium text-gray-900">{session}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                Trades: <span className="font-medium">{stats.totalTrades}</span>
              </p>
              <p className="text-sm text-gray-600">
                Win Rate:{" "}
                <span className="font-medium">{stats.winRate.toFixed(1)}%</span>
              </p>
              <p className="text-sm text-gray-600">
                Avg P/L:{" "}
                <span
                  className={`font-medium ${
                    stats.avgProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${stats.avgProfit.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Performance Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Hourly Performance{" "}
          {selectedSession !== "all" && `(${selectedSession})`}
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Win Rate") return `${value.toFixed(1)}%`;
                  return `$${value.toFixed(2)}`;
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="winRate"
                name="Win Rate"
                fill="#8884d8"
              />
              <Bar
                yAxisId="right"
                dataKey="avgProfit"
                name="Avg Profit"
                fill="#82ca9d"
              >
                {filteredTimeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.avgProfit >= 0 ? "#82ca9d" : "#ff7675"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TimeAnalysis;
