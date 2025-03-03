import React from "react";
import StopLossStudy from "./StopLossStudy";

const Planning = ({ trades, user, stats }) => {
  return (
    <div className="space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-800/40 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50">
      <StopLossStudy trades={trades} user={user} stats={stats} />
    </div>
  );
};

export default Planning;
