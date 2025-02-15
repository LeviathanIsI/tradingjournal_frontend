import React from "react";
import StopLossStudy from "./StopLossStudy";

const Planning = ({ trades, user, stats }) => {
  return (
    <div className="space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg">
      <StopLossStudy trades={trades} user={user} stats={stats} />
    </div>
  );
};

export default Planning;
