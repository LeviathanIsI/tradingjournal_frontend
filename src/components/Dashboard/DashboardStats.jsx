// components/Dashboard/DashboardStats.jsx
import React from "react";
import StatsOverview from "./StatsOverview";
import { formatCurrency } from "./utils/formatters";

/**
 * Dashboard statistics overview component
 *
 * This is a wrapper around the existing StatsOverview component
 * to integrate it into the new component structure
 *
 * @param {Object} props
 * @param {Object} props.user - Current user data
 * @param {Object} props.stats - Trading statistics
 */
const DashboardStats = ({ user, stats }) => {
  return (
    <div className="bg-transparent">
      <StatsOverview
        user={user}
        stats={stats}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(DashboardStats);
