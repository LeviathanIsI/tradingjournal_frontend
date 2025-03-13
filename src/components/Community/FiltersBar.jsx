import {
  Filter,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";

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
    <div className="bg-white/90 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-sm p-5 sm:p-6 mb-6 backdrop-blur-sm">
      <div className="grid gap-5">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600/70 rounded-md 
            bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
            placeholder-gray-500 dark:placeholder-gray-400 
            focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-col md:flex-row gap-5 justify-between bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200/70 dark:border-gray-600/30">
          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-full">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Filters:
              </span>
            </div>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <div className="relative">
                <select
                  value={filters.profitType}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      profitType: e.target.value,
                    }))
                  }
                  className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600/70 rounded-md text-sm 
                  bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                  cursor-pointer transition-all hover:border-primary focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All Trades</option>
                  <option value="winning">Winning Trades</option>
                  <option value="losing">Losing Trades</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={filters.timeFrame}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      timeFrame: e.target.value,
                    }))
                  }
                  className="pl-8 pr-8 py-2 border border-gray-300 dark:border-gray-600/70 rounded-md text-sm 
                  bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                  cursor-pointer transition-all hover:border-primary focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Sort Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-secondary/10 dark:bg-secondary/20 rounded-full">
                <ArrowUpDown className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Sort:
              </span>
            </div>

            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => setSort(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600/70 rounded-md text-sm 
                bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                cursor-pointer transition-all hover:border-secondary focus:ring-2 focus:ring-secondary focus:border-secondary appearance-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
