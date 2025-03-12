import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/communityUtils";
import { Award } from "lucide-react";

const LeaderboardTableRow = ({ trader, rank, isCurrentUser }) => {
  if (!trader) return null;

  const getRankDisplay = () => {
    if (rank <= 3) {
      return (
        <div className="flex items-center">
          <span className="mr-2">{rank}</span>
          <Award
            className={`h-4 w-4 ${
              rank === 1
                ? "text-yellow-500"
                : rank === 2
                ? "text-gray-400"
                : "text-amber-600"
            }`}
          />
        </div>
      );
    }
    return rank;
  };

  return (
    <tr
      className={`
        transition-colors
        ${
          isCurrentUser
            ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
            : "hover:bg-gray-50/80 dark:hover:bg-gray-700/30"
        }
      `}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
        {getRankDisplay()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Link
            to={`/community/profile/${trader.username}`}
            className="text-sm font-medium text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 transition-colors"
          >
            {trader.username}
          </Link>
          {isCurrentUser && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded">
              You
            </span>
          )}
        </div>
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
        <span className="font-medium text-primary dark:text-primary/90">
          {trader.stats.winRate}%
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-accent dark:text-accent/90">
        {trader.stats.totalTrades}
      </td>
    </tr>
  );
};

export default LeaderboardTableRow;
