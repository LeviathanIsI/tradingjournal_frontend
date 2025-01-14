import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProfitLossChart = ({ trades }) => {
  // Process trades to get cumulative P/L over time
  const chartData = trades
    .filter((trade) => trade.status === "CLOSED") // Only include closed trades
    .sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate)) // Sort by exit date
    .reduce((acc, trade) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      return [
        ...acc,
        {
          date: new Date(trade.exitDate).toLocaleDateString(),
          profit: trade.profitLoss.realized,
          cumulative: lastValue + trade.profitLoss.realized,
        },
      ];
    }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: "black" }} />
        <YAxis tick={{ fill: "black" }} tickFormatter={formatCurrency} />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
          labelStyle={{ color: "black" }}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProfitLossChart;