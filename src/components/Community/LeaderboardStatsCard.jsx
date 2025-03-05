import React from "react";
import { LineChart, Trophy, Target } from "lucide-react";

const LeaderboardStatsCard = ({ icon, label, value, valueColor }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-gray-700/60 p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
    <div className="p-2 rounded-sm bg-blue-50 dark:bg-blue-900/30">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-base font-semibold ${valueColor}`}>{value}</p>
    </div>
  </div>
);

export default LeaderboardStatsCard;
