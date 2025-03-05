import { Link } from "react-router-dom";

const LeaderboardCard = ({ trader, rank, formatCurrency }) => (
  <div className="p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          #{rank}
        </span>
        <Link
          to={`/community/profile/${trader.username}`}
          className="text-sm font-medium text-blue-600 dark:text-blue-400"
        >
          {trader.username}
        </Link>
      </div>
      <span
        className={`text-sm font-medium ${
          trader.stats.totalProfit >= 0
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {formatCurrency(trader.stats.totalProfit)}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <span className="text-gray-500 dark:text-gray-400">Win Rate:</span>
        <span className="ml-2 text-gray-900 dark:text-gray-100">
          {trader.stats.winRate}%
        </span>
      </div>
      <div>
        <span className="text-gray-500 dark:text-gray-400">Trades:</span>
        <span className="ml-2 text-gray-900 dark:text-gray-100">
          {trader.stats.totalTrades}
        </span>
      </div>
    </div>
  </div>
);

export default LeaderboardCard;
