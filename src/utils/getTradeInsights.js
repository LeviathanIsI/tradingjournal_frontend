const getTradeInsights = (trades, stats) => {
  if (!trades?.length) return [];

  const insights = [];
  const closedTrades = trades.filter((trade) => trade.status === "CLOSED");

  // Time-based analysis
  const timeAnalysis = trades.reduce(
    (acc, trade) => {
      const entryTime = new Date(trade.entryDate);
      const hour = entryTime.getHours();

      // Track performance by hour
      if (!acc.hourlyStats[hour]) {
        acc.hourlyStats[hour] = { wins: 0, losses: 0, totalPL: 0 };
      }

      if (trade.profitLoss?.realized > 0) {
        acc.hourlyStats[hour].wins++;
      } else {
        acc.hourlyStats[hour].losses++;
      }
      acc.hourlyStats[hour].totalPL += trade.profitLoss?.realized || 0;

      // Track morning vs afternoon performance
      if (hour < 12) {
        acc.morningTrades.push(trade);
      } else {
        acc.afternoonTrades.push(trade);
      }

      return acc;
    },
    {
      hourlyStats: {},
      morningTrades: [],
      afternoonTrades: [],
    }
  );

  // Best and worst performing hours
  const hourlyPerformance = Object.entries(timeAnalysis.hourlyStats)
    .map(([hour, stats]) => ({
      hour: parseInt(hour),
      winRate: (stats.wins / (stats.wins + stats.losses)) * 100,
      avgPL: stats.totalPL / (stats.wins + stats.losses),
    }))
    .sort((a, b) => b.avgPL - a.avgPL);

  const bestHour = hourlyPerformance[0];
  const worstHour = hourlyPerformance[hourlyPerformance.length - 1];

  if (bestHour && bestHour.avgPL > 0) {
    insights.push({
      type: "timing",
      icon: "Clock",
      color: "green",
      message: `Your most profitable trading hour is ${
        bestHour.hour
      }:00 with an average P/L of $${bestHour.avgPL.toFixed(2)}`,
    });
  }

  // Position sizing analysis
  const avgPositionSize =
    trades.reduce((sum, trade) => sum + (trade.shares || 0), 0) / trades.length;

  const positionSizeVariance = Math.sqrt(
    trades.reduce(
      (sum, trade) => sum + Math.pow((trade.shares || 0) - avgPositionSize, 2),
      0
    ) / trades.length
  );

  if (positionSizeVariance > avgPositionSize * 0.5) {
    insights.push({
      type: "risk",
      icon: "AlertTriangle",
      color: "yellow",
      message:
        "Your position sizing varies significantly. Consider standardizing your position sizes for more consistent results",
    });
  }

  // Win rate patterns
  if (stats?.winRate < 50) {
    insights.push({
      type: "performance",
      icon: "Target",
      color: "red",
      message:
        "Consider reviewing your entry criteria as your win rate is below 50%",
    });
  } else if (stats?.winRate > 65) {
    insights.push({
      type: "performance",
      icon: "Award",
      color: "green",
      message:
        "Strong win rate above 65%. Focus on increasing position size on high-conviction setups",
    });
  }

  // Average hold time analysis
  const holdTimes = trades
    .filter((t) => t.exitDate && t.entryDate)
    .map((trade) => {
      const entry = new Date(trade.entryDate);
      const exit = new Date(trade.exitDate);
      return {
        duration: (exit - entry) / (1000 * 60), // in minutes
        profitable: trade.profitLoss?.realized > 0,
      };
    });

  const avgProfitableHoldTime =
    holdTimes
      .filter((t) => t.profitable)
      .reduce((sum, t) => sum + t.duration, 0) /
    holdTimes.filter((t) => t.profitable).length;

  const avgLosingHoldTime =
    holdTimes
      .filter((t) => !t.profitable)
      .reduce((sum, t) => sum + t.duration, 0) /
    holdTimes.filter((t) => !t.profitable).length;

  if (avgLosingHoldTime > avgProfitableHoldTime * 1.5) {
    insights.push({
      type: "timing",
      icon: "Clock",
      color: "yellow",
      message:
        "You tend to hold losing trades longer than winning trades. Consider implementing stricter stop-loss rules",
    });
  }

  // Day of week analysis
  const dayPerformance = trades.reduce((acc, trade) => {
    const day = new Date(trade.entryDate).getDay();
    if (!acc[day]) {
      acc[day] = { pl: 0, count: 0 };
    }
    acc[day].pl += trade.profitLoss?.realized || 0;
    acc[day].count++;
    return acc;
  }, {});

  const bestDay = Object.entries(dayPerformance)
    .map(([day, stats]) => ({
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseInt(day)],
      avgPL: stats.pl / stats.count,
    }))
    .sort((a, b) => b.avgPL - a.avgPL)[0];

  if (bestDay) {
    insights.push({
      type: "timing",
      icon: "Calendar",
      color: "blue",
      message: `Your most profitable trading day is ${
        bestDay.day
      } with avg P/L of $${bestDay.avgPL.toFixed(2)}`,
    });
  }

  // Streak analysis
  const currentStreak = trades.reduce((streak, trade) => {
    if (trade.profitLoss?.realized > 0) return streak + 1;
    return 0;
  }, 0);

  if (currentStreak > 3) {
    insights.push({
      type: "performance",
      icon: "Award",
      color: "green",
      message: `You're on a ${currentStreak}-trade winning streak! Keep following your successful strategy`,
    });
  }

  return insights;
};

export default getTradeInsights;
