// src/components/FiltersBar.jsx
import { Filter, ArrowUpDown } from "lucide-react";

const FiltersBar = ({
  filters,
  setFilters,
  sortOptions,
  currentSort,
  setSort,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>
          </div>

          <select
            value={filters.profitType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, profitType: e.target.value }))
            }
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Trades</option>
            <option value="winning">Winning Trades</option>
            <option value="losing">Losing Trades</option>
          </select>

          <select
            value={filters.timeFrame}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, timeFrame: e.target.value }))
            }
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
          </div>

          <select
            value={currentSort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
