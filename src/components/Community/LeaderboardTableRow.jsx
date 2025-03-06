import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/communityUtils";

const LeaderboardTableRow = ({ trader, rank }) => {
  if (!trader) return null;

  return (
    <tr
      className={`${
        rank % 2 === 0
          ? "bg-white dark:bg-gray-700/60"
          : "bg-gray-50 dark:bg-gray-600/40"
      }`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {rank}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          to={`/community/profile/${trader.username}`}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
        >
          {trader.username}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
        <span
          className={`font-medium ${
            trader.stats.totalProfit >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(trader.stats.totalProfit)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
        {trader.stats.winRate}%
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
        {trader.stats.totalTrades}
      </td>
    </tr>
  );
};

export default LeaderboardTableRow;
