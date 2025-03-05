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
    <div className="bg-white dark:bg-gray-700/70 rounded-xl border border-gray-200 dark:border-gray-600/50 shadow-lg p-4 sm:p-6 mb-6">
      <div className="grid gap-4 sm:gap-6">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:outline-none transition-shadow"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-between">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Filters:
            </span>
            <select
              value={filters.profitType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, profitType: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 cursor-pointer transition"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 cursor-pointer transition"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <ArrowUpDown className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Sort:
            </span>
            <select
              value={currentSort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 cursor-pointer transition"
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
    </div>
  );
};

export default FiltersBar;
