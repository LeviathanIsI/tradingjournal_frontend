import React from "react";
import { LineChart, Trophy, Target } from "lucide-react";

const LeaderboardStatsCard = ({ icon, label, value, valueColor, detail }) => (
  <div className="bg-white/90 dark:bg-gray-800/60 p-4 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm transition-all hover:shadow">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-full bg-primary/10 dark:bg-primary/20 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
          {label}
        </p>
        <p className={`text-lg font-bold ${valueColor}`}>{value}</p>
        {detail && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {detail}
          </p>
        )}
      </div>
    </div>
    <div className="h-1 w-16 bg-primary/10 rounded-full mt-2.5"></div>
  </div>
);

export default LeaderboardStatsCard;
