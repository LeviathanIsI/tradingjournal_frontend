import React from "react";
import StopLossStudy from "./StopLossStudy";

const Planning = ({ trades, user, stats }) => {
  return (
    <div className="space-y-5 bg-gray-50/70 dark:bg-gray-900/30 p-5 rounded-sm border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm shadow-sm">
      <StopLossStudy trades={trades} user={user} stats={stats} />
    </div>
  );
};

export default Planning;
