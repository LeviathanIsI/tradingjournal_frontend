import { Link } from "react-router-dom";
import { Award, TrendingUp, BarChart2 } from "lucide-react";

const LeaderboardCard = ({ trader, rank, formatCurrency }) => (
  <div className="bg-white/90 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm p-4 space-y-4 backdrop-blur-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 dark:bg-primary/20">
          <span className="text-sm font-medium text-primary dark:text-primary/90">
            {rank}
          </span>
        </div>
        <Link
          to={`/community/profile/${trader.username}`}
          className="text-sm font-medium text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 transition-colors"
        >
          {trader.username}
        </Link>
        {rank <= 3 && <Award className="h-4 w-4 text-yellow-500" />}
      </div>
      <span
        className={`text-sm font-bold px-2.5 py-1 rounded-full ${
          trader.stats.totalProfit >= 0
            ? "bg-green-100/80 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            : "bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        }`}
      >
        {formatCurrency(trader.stats.totalProfit)}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50/80 dark:bg-gray-700/30 p-3 rounded-md">
      <div className="flex items-center">
        <TrendingUp className="h-4 w-4 text-primary/70 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">Win Rate:</span>
        <span className="ml-1.5 text-gray-900 dark:text-gray-100 font-medium">
          {trader.stats.winRate}%
        </span>
      </div>
      <div className="flex items-center">
        <BarChart2 className="h-4 w-4 text-accent/70 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">Trades:</span>
        <span className="ml-1.5 text-gray-900 dark:text-gray-100 font-medium">
          {trader.stats.totalTrades}
        </span>
      </div>
    </div>
  </div>
);

export default LeaderboardCard;
