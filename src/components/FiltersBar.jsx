import { Filter, ArrowUpDown, Search } from "lucide-react";

const FiltersBar = ({
  filters,
  setFilters,
  sortOptions,
  currentSort,
  setSort,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by:
            </span>
          </div>

          <select
            value={filters.profitType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, profitType: e.target.value }))
            }
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </span>
          </div>

          <select
            value={currentSort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
