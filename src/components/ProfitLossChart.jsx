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

const TIMEFRAMES = {
  DAY: "Daily",
  WEEK: "Weekly",
  MONTH: "Monthly",
  YEAR: "Yearly",
  ALL: "All Time",
};

const ProfitLossChart = ({ trades }) => {
  const [timeframe, setTimeframe] = useState("ALL");

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Function to group data by timeframe
  const groupDataByTimeframe = (data, tf) => {
    return data.reduce((acc, item) => {
      let dateKey;
      const date = new Date(item.date);

      switch (tf) {
        case "DAY":
          dateKey = date.toLocaleDateString();
          break;
        case "WEEK":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toLocaleDateString();
          break;
        case "MONTH":
          dateKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
          break;
        case "YEAR":
          dateKey = date.getFullYear().toString();
          break;
        default:
          dateKey = date.toLocaleDateString();
      }

      const existingEntry = acc.find((x) => x.date === dateKey);
      if (existingEntry) {
        existingEntry.cumulative = item.cumulative;
      } else {
        acc.push({ date: dateKey, cumulative: item.cumulative });
      }
      return acc;
    }, []);
  };

  // Process trade data
  const chartData = useMemo(() => {
    const rawData = trades
      .filter((trade) => trade.status === "CLOSED")
      .sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate))
      .reduce((acc, trade) => {
        const lastValue = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
        return [
          ...acc,
          {
            date: new Date(trade.exitDate),
            profit: trade.profitLoss.realized,
            cumulative: lastValue + trade.profitLoss.realized,
          },
        ];
      }, []);

    return timeframe === "ALL"
      ? rawData
      : groupDataByTimeframe(rawData, timeframe);
  }, [trades, timeframe]);

  return (
    <div className="h-full flex flex-col">
      {/* Timeframe Controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Profit/Loss Over Time
        </h2>
        <div className="flex space-x-2">
          {Object.entries(TIMEFRAMES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              className={`px-3 py-1 rounded text-sm ${
                timeframe === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 70, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#374151" }}
              tickFormatter={(date) => {
                if (typeof date === "string") return date;
                return new Date(date).toLocaleDateString();
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#374151" }}
              tickFormatter={formatCurrency}
              width={65}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
                padding: "8px",
              }}
              labelStyle={{ color: "#374151" }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#2563eb"
              strokeWidth={2}
              dot={timeframe !== "DAY"}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitLossChart;
