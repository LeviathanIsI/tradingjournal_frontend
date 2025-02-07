import React from "react";

const StatsOverview = ({ user, stats, formatCurrency }) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      data-tour="stats-overview"
    >
      <div className="bg-white p-4 rounded shadow" data-tour="starting-capital">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm text-black">Starting Capital</h3>
            <p className="text-2xl font-bold text-black">
              {formatCurrency(user?.preferences?.startingCapital || 0)}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-black">Current Balance</h3>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-2xl font-bold ${
                  stats?.totalProfit > 0
                    ? "text-green-600"
                    : stats?.totalProfit < 0
                    ? "text-red-600"
                    : "text-black"
                }`}
              >
                {formatCurrency(
                  (user?.preferences?.startingCapital || 0) +
                    (stats?.totalProfit || 0)
                )}
              </p>
              {user?.preferences?.startingCapital > 0 && (
                <span
                  className={`text-sm ${
                    stats?.totalProfit > 0
                      ? "text-green-600"
                      : stats?.totalProfit < 0
                      ? "text-red-600"
                      : "text-black"
                  }`}
                >
                  {(
                    ((stats?.totalProfit || 0) /
                      user.preferences.startingCapital) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow flex justify-between">
        <div>
          <h3 className="text-sm text-black">Total Trades</h3>
          <p className="text-2xl font-bold text-black">
            {stats?.totalTrades || 0}
          </p>
        </div>
        <div>
          <h3 className="text-sm text-black">Win Rate</h3>
          <p className="text-2xl font-bold text-black">
            {stats?.winRate?.toFixed(1) || 0}%
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm text-black">Total P/L</h3>
        <p
          className={`text-2xl font-bold ${
            (stats?.totalProfit || 0) >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(stats?.totalProfit || 0)}
        </p>
      </div>
    </div>
  );
};

export default StatsOverview;
