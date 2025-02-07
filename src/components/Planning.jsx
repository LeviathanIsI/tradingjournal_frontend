import React from "react";
import StopLossStudy from "./StopLossStudy";

const Planning = ({ trades, user, stats }) => {
  return (
    <div className="space-y-6">
      <StopLossStudy trades={trades} user={user} stats={stats} />
    </div>
  );
};

export default Planning;
