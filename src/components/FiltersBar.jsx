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
    <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search - Full width on mobile */}
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Filter by:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4">
            <select
              value={filters.profitType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, profitType: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm text-sm
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm text-sm
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Sort Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Sort by:
            </span>
          </div>

          <select
            value={currentSort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm text-sm
              bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
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
