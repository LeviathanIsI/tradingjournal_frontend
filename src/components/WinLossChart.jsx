import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WinLossChart = ({ trades }) => {
  // Process trades to get distribution data
  const profitLosses = trades
    .filter((trade) => trade.status === "CLOSED") // Only include closed trades
    .map((trade) => trade.profitLoss.realized);

  // Create bins for the distribution
  const binSize = 50; // Adjust this value based on your typical trade sizes
  const bins = {};

  profitLosses.forEach((pl) => {
    const binIndex = Math.floor(pl / binSize) * binSize;
    bins[binIndex] = (bins[binIndex] || 0) + 1;
  });

  const chartData = Object.entries(bins)
    .map(([range, count]) => ({
      range: `${Number(range).toFixed(0)}`,
      count,
      isProfit: Number(range) >= 0,
    }))
    .sort((a, b) => Number(a.range) - Number(b.range));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="range"
          tick={{ fill: "black" }}
          tickFormatter={formatCurrency}
        />
        <YAxis
          tick={{ fill: "black" }}
          label={{
            value: "Number of Trades",
            angle: -90,
            position: "insideLeft",
            fill: "black",
          }}
        />
        <Tooltip
          formatter={(value, name, props) => [value, "Number of Trades"]}
          labelFormatter={(value) => `P/L Range: ${formatCurrency(value)}`}
          contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
          labelStyle={{ color: "black" }}
        />
        <Bar
          dataKey="count"
          fill={(data) => (data.isProfit ? "#22c55e" : "#ef4444")}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WinLossChart;
