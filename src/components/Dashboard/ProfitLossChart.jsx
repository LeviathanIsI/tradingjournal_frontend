import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Table, Info } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const TIMEFRAMES = {
  DAY: "Daily",
  WEEK: "Weekly",
  MONTH: "Monthly",
  YEAR: "Yearly",
  ALL: "All Time",
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label, displayMode }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const winRate = ((data.wins / data.dailyTrades) * 100).toFixed(1);

    // Parse the date string correctly
    const [year, month, day] = data.date.split("-").map(Number);
    const tooltipDate = new Date(year, month - 1, day);

    return (
      <div className="bg-white/95 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/40 rounded-sm p-3 shadow-md backdrop-blur-sm">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          {tooltipDate.toLocaleDateString()}
        </p>
        <div className="mt-2 space-y-1.5">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Daily P/L:
            <span
              className={`ml-2 font-medium ${
                data.profit >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(data.profit)}
            </span>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Win Rate: <span className="ml-2 font-medium">{winRate}%</span>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Trades: <span className="ml-2 font-medium">{data.dailyTrades}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Helper function to group data by timeframe
const groupDataByTimeframe = (data, tf) => {
  return data.reduce((acc, item) => {
    let dateKey;
    const [year, month, day] = item.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    switch (tf) {
      case "WEEK": {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = `${weekStart.getFullYear()}-${String(
          weekStart.getMonth() + 1
        ).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
        break;
      }
      case "MONTH": {
        dateKey = `${year}-${String(month).padStart(2, "0")}-01`;
        break;
      }
      case "YEAR": {
        dateKey = `${year}-01-01`;
        break;
      }
      default:
        dateKey = item.date;
    }

    let existingEntry = acc.find((x) => x.date === dateKey);
    if (existingEntry) {
      existingEntry.profit += item.profit;
      existingEntry.cumulative = item.cumulative;
      existingEntry.wins += item.wins;
      existingEntry.dailyTrades += item.dailyTrades;
      existingEntry.totalTrades = item.totalTrades;
    } else {
      acc.push({
        ...item,
        date: dateKey,
      });
    }
    return acc;
  }, []);
};

// Update the filterTradesByTimeframe function
const filterTradesByTimeframe = (trades, selectedDate, timeframe) => {
  if (!selectedDate || !trades.length) return [];

  // Create date preserving the local date components
  const [year, month, day] = selectedDate.split("-").map(Number);
  // Use setFullYear to avoid any timezone shifts
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  let startDate, endDate;

  switch (timeframe) {
    case "WEEK": {
      startDate = new Date(date);
      startDate.setDate(date.getDate() - date.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case "MONTH": {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case "YEAR": {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    default: {
      // DAY
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    }
  }

  return trades
    .filter((trade) => {
      const tradeDate = new Date(trade.exitDate);
      const isInRange =
        trade.status === "CLOSED" &&
        tradeDate >= startDate &&
        tradeDate <= endDate;

      return isInRange;
    })
    .sort((a, b) => new Date(b.exitDate) - new Date(a.exitDate));
};

const TradesTable = ({ trades }) => {
  return (
    <div className="mt-4 border dark:border-gray-700/40 rounded-sm overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/40">
        <thead className="bg-gray-50/80 dark:bg-gray-700/30">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Entry
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Exit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              P/L
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/90 dark:bg-gray-800/80 divide-y divide-gray-200 dark:divide-gray-700/40">
          {trades.map((trade) => (
            <tr
              key={trade._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {new Date(trade.exitDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {trade.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {trade.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                {formatCurrency(trade.entryPrice)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                {formatCurrency(trade.exitPrice)}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium
                ${
                  trade.profitLoss.realized >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(trade.profitLoss.realized)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProfitLossChart = ({ trades }) => {
  const [timeframe, setTimeframe] = useState("ALL");
  const [showTrades, setShowTrades] = useState(false);
  const [displayMode, setDisplayMode] = useState("currency");
  const [selectedDate, setSelectedDate] = useState(null);
  const { isDark } = useTheme();

  const chartData = useMemo(() => {
    let runningTotal = 0;
    let runningWins = 0;
    let runningTrades = 0;

    const rawData = trades
      .filter((trade) => trade.status === "CLOSED")
      .sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate))
      .reduce((acc, trade) => {
        // Create a date object and get components
        const tradeDate = new Date(trade.exitDate);
        const year = tradeDate.getFullYear();
        const month = tradeDate.getMonth() + 1;
        const day = tradeDate.getDate();

        // Create date key in YYYY-MM-DD format
        const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

        const isWin = trade.profitLoss.realized > 0;
        runningTotal += trade.profitLoss.realized;
        if (isWin) runningWins++;
        runningTrades++;

        let dayEntry = acc.find((entry) => entry.date === dateKey);
        if (!dayEntry) {
          dayEntry = {
            date: dateKey,
            actualDate: tradeDate.toISOString(), // Store the actual date for reference
            profit: 0,
            cumulative: runningTotal,
            wins: 0,
            dailyTrades: 0,
            totalTrades: runningTrades,
          };
          acc.push(dayEntry);
        }

        dayEntry.profit += trade.profitLoss.realized;
        dayEntry.cumulative = runningTotal;
        dayEntry.wins += isWin ? 1 : 0;
        dayEntry.dailyTrades++;

        return acc;
      }, []);

    return timeframe === "ALL"
      ? rawData
      : groupDataByTimeframe(rawData, timeframe);
  }, [trades, timeframe]);

  const filteredTrades = useMemo(() => {
    return filterTradesByTimeframe(trades, selectedDate, timeframe);
  }, [trades, selectedDate, timeframe]);

  const yAxisDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const values = chartData.map((d) => d.cumulative);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Profit/Loss Over Time
      </h2>

      <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-sm border border-gray-200/70 dark:border-gray-600/30 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Chart features:
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1.5">
            <li>• View performance in dollars or percentage gains</li>
            <li>• Switch between daily, weekly, monthly, or yearly views</li>
            <li>• Click any point to see trades from that period</li>
            <li>• Track cumulative profit/loss over your selected timeframe</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={() => setShowTrades(!showTrades)}
            disabled={!selectedDate}
            className={`flex items-center gap-2 px-4 py-2 text-sm bg-white/90 dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600/70 round-sm w-full sm:w-auto justify-center sm:justify-start text-gray-900 dark:text-gray-100 shadow-sm
            ${
              !selectedDate
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50/90 hover:shadow dark:hover:bg-gray-700/60 transition-all"
            }`}
          >
            <Table size={16} />
            {showTrades ? "Hide Trades" : "Show Trades"}
          </button>
          {selectedDate && (
            <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/30 px-3 py-1 round-sm border border-gray-200/70 dark:border-gray-600/30">
              Selected: {selectedDate}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex border border-gray-300 dark:border-gray-600/70 round-sm shadow-sm overflow-hidden">
            <button
              onClick={() => setDisplayMode("currency")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm ${
                displayMode === "currency"
                  ? "bg-primary text-white"
                  : "bg-white/90 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200 hover:bg-gray-50/90 dark:hover:bg-gray-700/60 transition-colors"
              }`}
            >
              Dollar
            </button>
            <button
              onClick={() => setDisplayMode("percentage")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm border-l border-gray-300 dark:border-gray-600/70 ${
                displayMode === "percentage"
                  ? "bg-primary text-white"
                  : "bg-white/90 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200 hover:bg-gray-50/90 dark:hover:bg-gray-700/60 transition-colors"
              }`}
            >
              Percent
            </button>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            {Object.entries(TIMEFRAMES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTimeframe(key)}
                className={`px-4 py-2 round-sm text-sm shadow-sm ${
                  timeframe === key
                    ? "bg-primary text-white"
                    : "bg-white/90 dark:bg-gray-700/40 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600/70 hover:bg-gray-50/90 dark:hover:bg-gray-700/60 hover:shadow transition-all"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[400px] sm:h-[600px] bg-white/90 dark:bg-gray-800/80 p-4 rounded-sm border border-gray-200/70 dark:border-gray-700/40 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 70, bottom: 20 }}
            onClick={(data) => {
              if (data && data.activePayload) {
                const clickedDate = data.activePayload[0].payload.date;
                setSelectedDate((prevDate) =>
                  prevDate === clickedDate ? null : clickedDate
                );
                if (!showTrades) setShowTrades(true);
              }
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#374151" : "#e5e7eb"}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: isDark ? "#9CA3AF" : "#374151" }}
              tickFormatter={(date) => {
                const [year, month, day] = date.split("-");
                return new Date(year, month - 1, day).toLocaleDateString();
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yAxisDomain}
              tick={{ fill: isDark ? "#9CA3AF" : "#374151" }}
              tickFormatter={(value) =>
                displayMode === "percentage"
                  ? `${((value / chartData[0].cumulative - 1) * 100).toFixed(
                      2
                    )}%`
                  : formatCurrency(value)
              }
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark
                  ? "rgba(31, 41, 55, 0.9)"
                  : "rgba(255, 255, 255, 0.95)",
                border: isDark
                  ? "1px solid rgba(75, 85, 99, 0.5)"
                  : "1px solid rgba(229, 231, 235, 0.8)",
                borderRadius: "0.5rem",
                backdropFilter: "blur(8px)",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              content={
                <CustomTooltip
                  displayMode={displayMode}
                  timeframe={timeframe}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={timeframe !== "DAY"}
              activeDot={{
                r: 6,
                fill: (dot) =>
                  dot.payload.date === selectedDate ? "#3b82f6" : "#fff",
                stroke: "#3b82f6",
                strokeWidth: 2,
              }}
              formatter={(value) =>
                displayMode === "percentage"
                  ? ((value / chartData[0].cumulative - 1) * 100).toFixed(2)
                  : value
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showTrades && selectedDate && (
        <div className="border-t border-gray-200 dark:border-gray-700/40 pt-5">
          {filteredTrades.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Trades for {timeframe === "WEEK" ? "Week of " : ""}
                {timeframe === "MONTH"
                  ? new Date(selectedDate).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })
                  : timeframe === "YEAR"
                  ? new Date(selectedDate).getFullYear()
                  : selectedDate}
              </h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <TradesTable trades={filteredTrades} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white/90 dark:bg-gray-800/80 rounded-sm border border-gray-200/70 dark:border-gray-700/40 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">
                No trades found for {timeframe === "WEEK" ? "Week of " : ""}
                {timeframe === "MONTH"
                  ? new Date(selectedDate).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })
                  : timeframe === "YEAR"
                  ? new Date(selectedDate).getFullYear()
                  : selectedDate}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfitLossChart;
