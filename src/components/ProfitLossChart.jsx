import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Table } from "lucide-react";

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
    const winRate = ((data.wins / data.totalTrades) * 100).toFixed(1);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900">
          {new Date(data.date).toLocaleDateString()}
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-600">
            Daily P/L:
            <span
              className={`ml-2 font-medium ${
                data.profit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(data.profit)}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Win Rate: <span className="ml-2 font-medium">{winRate}%</span>
          </p>
          <p className="text-sm text-gray-600">
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
    const date = new Date(item.date);

    switch (tf) {
      case "WEEK":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = weekStart.toISOString().split("T")[0];
        break;
      case "MONTH":
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-01`;
        break;
      case "YEAR":
        dateKey = `${date.getFullYear()}-01-01`;
        break;
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

const TradesTable = ({ trades }) => {
  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Entry
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Exit
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              P/L
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {trades.map((trade) => (
            <tr key={trade._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(trade.exitDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {trade.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {trade.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(trade.entryPrice)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(trade.exitPrice)}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium
                ${
                  trade.profitLoss.realized >= 0
                    ? "text-green-600"
                    : "text-red-600"
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
  console.log("Incoming trades:", trades);
  const [timeframe, setTimeframe] = useState("ALL");
  const [showTrades, setShowTrades] = useState(false);
  const [displayMode, setDisplayMode] = useState("currency");
  const [selectedDate, setSelectedDate] = useState(null);

  const chartData = useMemo(() => {
    console.log("Starting chartData calculation");
    let runningTotal = 0;
    let runningWins = 0;
    let runningTrades = 0;

    const rawData = trades
      .filter((trade) => trade.status === "CLOSED")
      .sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate))
      .reduce((acc, trade) => {
        const tradeDate = new Date(trade.exitDate).toLocaleDateString("en-US", {
          timeZone: "America/New_York",
        });

        const isWin = trade.profitLoss.realized > 0;

        runningTotal += trade.profitLoss.realized;
        if (isWin) runningWins++;
        runningTrades++;

        let dayEntry = acc.find((entry) => entry.date === tradeDate);
        if (!dayEntry) {
          dayEntry = {
            date: tradeDate,
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

    console.log("Raw data:", rawData);

    console.log("Final rawData:", rawData);
    return timeframe === "ALL"
      ? rawData
      : groupDataByTimeframe(rawData, timeframe);
  }, [trades, timeframe]);

  const filteredTrades = useMemo(() => {
    if (!selectedDate) return [];
    return trades
      .filter(
        (trade) =>
          trade.status === "CLOSED" &&
          new Date(trade.exitDate).toLocaleDateString() === selectedDate
      )
      .sort((a, b) => new Date(b.exitDate) - new Date(a.exitDate));
  }, [trades, selectedDate]);

  const yAxisDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const values = chartData.map((d) => d.cumulative);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Profit/Loss Over Time
          </h2>
          <button
            onClick={() => setShowTrades(!showTrades)}
            disabled={!selectedDate}
            className={`flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-300 rounded
              ${
                !selectedDate
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
          >
            <Table size={16} />
            {showTrades ? "Hide Trades" : "Show Trades"}
          </button>
          {selectedDate && (
            <span className="text-sm text-gray-600">
              Selected: {selectedDate}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setDisplayMode("currency")}
              className={`px-3 py-1 text-sm rounded-l-lg ${
                displayMode === "currency"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dollar
            </button>
            <button
              onClick={() => setDisplayMode("percentage")}
              className={`px-3 py-1 text-sm rounded-r-lg border-l border-gray-300 ${
                displayMode === "percentage"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Percent
            </button>
          </div>
          <div className="flex space-x-2">
            {Object.entries(TIMEFRAMES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTimeframe(key)}
                className={`px-3 py-1 rounded text-sm ${
                  timeframe === key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: "600px", minHeight: "600px" }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#374151" }}
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yAxisDomain}
              tick={{ fill: "#374151" }}
              tickFormatter={(value) =>
                displayMode === "percentage"
                  ? `${((value / chartData[0].cumulative - 1) * 100).toFixed(
                      2
                    )}%`
                  : formatCurrency(value)
              }
              width={80}
            />
            <Tooltip content={<CustomTooltip displayMode={displayMode} />} />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#2563eb"
              strokeWidth={2}
              dot={timeframe !== "DAY"}
              activeDot={{
                r: 6,
                fill: (dot) =>
                  dot.payload.date === selectedDate ? "#2563eb" : "#fff",
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
        <div className="border-t pt-6">
          {trades.filter(
            (trade) =>
              trade.status === "CLOSED" &&
              new Date(trade.exitDate).toLocaleDateString() === selectedDate
          ).length > 0 ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Trades for {selectedDate}
              </h3>
              <TradesTable
                trades={trades
                  .filter(
                    (trade) =>
                      trade.status === "CLOSED" &&
                      new Date(trade.exitDate).toLocaleDateString() ===
                        selectedDate
                  )
                  .sort((a, b) => new Date(b.exitDate) - new Date(a.exitDate))}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No trades found for {selectedDate}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfitLossChart;
