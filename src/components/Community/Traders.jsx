import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  SlidersHorizontal,
  Calendar,
  ArrowUpDown,
  Award,
  Clock,
  TrendingUp,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTradingStats } from "../../context/TradingStatsContext";
import TraderCard from "./TraderCard";

const Traders = () => {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tradersPerPage, setTradersPerPage] = useState(9); // Show 9 traders per page (3x3 grid)
  const [timeFilter, setTimeFilter] = useState("all"); // For join date
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [filters, setFilters] = useState({
    winRate: "all", // all, above50, above75, below50
    tradeCount: "all", // all, beginner, intermediate, advanced
    following: false, // Show only traders I follow
  });
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();
  const { formatters, normalizeTraderStats } = useTradingStats();
  const { formatPercent } = formatters;

  // Fetch traders
  useEffect(() => {
    const fetchTraders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/traders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch traders");
        }

        // Normalize trader stats before setting state
        const normalizedTraders = data.data.map(normalizeTraderStats);
        setTraders(normalizedTraders);
      } catch (error) {
        console.error("Error fetching traders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTraders();
  }, [normalizeTraderStats]);

  // Handle follow
  const handleFollow = async (traderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/follow/${traderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to follow trader");
      }

      setTraders(
        traders.map((trader) => {
          if (trader._id === traderId) {
            const isNowFollowing = !trader.followers.includes(user._id);
            return normalizeTraderStats({
              ...trader,
              followers: isNowFollowing
                ? [...trader.followers, user._id]
                : trader.followers.filter((id) => id !== user._id),
            });
          }
          return trader;
        })
      );
    } catch (error) {
      console.error("Error following trader:", error);
    }
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (timeFilter !== "all") count++;
    if (filters.winRate !== "all") count++;
    if (filters.tradeCount !== "all") count++;
    if (filters.following) count++;
    return count;
  }, [timeFilter, filters]);

  // Reset all filters
  const resetFilters = () => {
    setTimeFilter("all");
    setCustomDateRange({ start: "", end: "" });
    setFilters({
      winRate: "all",
      tradeCount: "all",
      following: false,
    });
    setCurrentPage(1);
  };

  // Filter traders based on all criteria
  const filteredTraders = useMemo(() => {
    return traders.filter((trader) => {
      // Text search filter
      const matchesSearch =
        trader.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trader.tradingStyle &&
          trader.tradingStyle
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Join date filter
      if (timeFilter !== "all") {
        const joinDate = new Date(trader.createdAt);
        const now = new Date();

        switch (timeFilter) {
          case "week":
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            if (joinDate < oneWeekAgo) return false;
            break;
          case "month":
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(now.getMonth() - 1);
            if (joinDate < oneMonthAgo) return false;
            break;
          case "quarter":
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            if (joinDate < threeMonthsAgo) return false;
            break;
          case "year":
            const oneYearAgo = new Date(now);
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            if (joinDate < oneYearAgo) return false;
            break;
          case "custom":
            if (customDateRange.start && customDateRange.end) {
              const start = new Date(customDateRange.start + "T00:00:00");
              const end = new Date(customDateRange.end + "T23:59:59.999");
              if (joinDate < start || joinDate > end) return false;
            }
            break;
          default:
            break;
        }
      }

      // Win rate filter
      if (filters.winRate !== "all") {
        const winRate = trader.stats?.winRate || 0;

        switch (filters.winRate) {
          case "above50":
            if (winRate < 50) return false;
            break;
          case "above75":
            if (winRate < 75) return false;
            break;
          case "below50":
            if (winRate >= 50) return false;
            break;
          default:
            break;
        }
      }

      // Trade count filter
      if (filters.tradeCount !== "all") {
        const tradeCount = trader.stats?.totalTrades || 0;

        switch (filters.tradeCount) {
          case "beginner":
            if (tradeCount > 20) return false;
            break;
          case "intermediate":
            if (tradeCount < 21 || tradeCount > 100) return false;
            break;
          case "advanced":
            if (tradeCount < 101) return false;
            break;
          default:
            break;
        }
      }

      // Following filter
      if (filters.following && !trader.followers.includes(user._id)) {
        return false;
      }

      // Passed all filters
      return true;
    });
  }, [traders, searchQuery, timeFilter, customDateRange, filters, user._id]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTraders.length / tradersPerPage);

  // Get current traders
  const currentTraders = useMemo(() => {
    const indexOfLastTrader = currentPage * tradersPerPage;
    const indexOfFirstTrader = indexOfLastTrader - tradersPerPage;
    return filteredTraders.slice(indexOfFirstTrader, indexOfLastTrader);
  }, [filteredTraders, currentPage, tradersPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of trader grid for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, timeFilter, filters]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-lg text-gray-700 dark:text-gray-200 flex flex-col items-center">
          <div className="flex space-x-2 items-center mb-4">
            <div className="h-2.5 w-2.5 bg-primary rounded-full"></div>
            <div className="h-2.5 w-2.5 bg-primary/70 rounded-full"></div>
            <div className="h-2.5 w-2.5 bg-primary/40 rounded-full"></div>
          </div>
          <p>Loading traders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-sm border border-red-100 dark:border-red-800/50 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-800/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-red-700 dark:text-red-400">
              Error Loading Traders
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center mb-6">
        <div className="h-6 w-1.5 bg-primary rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Community Traders
        </h2>
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by username or trading style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600/70 rounded-sm
              bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-2 px-4 py-3 border rounded-sm 
            ${
              showFilters
                ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border-primary/30 dark:border-primary/30"
                : "bg-white dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600/70"
            }
            transition-colors shadow-sm hover:shadow focus:outline-none`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800/60 p-4 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Advanced Filters
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Period Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary/70 dark:text-primary-light/70" />
                  Joined Within
                </label>
                <div className="relative">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600/70 round-sm
                      bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="all">Any Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last Year</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                    <ChevronLeft className="h-4 w-4 rotate-90" />
                  </div>
                </div>

                {/* Custom Date Range */}
                {timeFilter === "custom" && (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400 w-10">
                        From:
                      </label>
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) =>
                          setCustomDateRange((prev) => ({
                            ...prev,
                            start: e.target.value,
                          }))
                        }
                        className="w-full text-sm p-1.5 border border-gray-300 dark:border-gray-600/70 round-sm
                          bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400 w-10">
                        To:
                      </label>
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) =>
                          setCustomDateRange((prev) => ({
                            ...prev,
                            end: e.target.value,
                          }))
                        }
                        className="w-full text-sm p-1.5 border border-gray-300 dark:border-gray-600/70 round-sm
                          bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Win Rate Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary/70 dark:text-primary-light/70" />
                  Win Rate
                </label>
                <div className="relative">
                  <select
                    value={filters.winRate}
                    onChange={(e) =>
                      setFilters({ ...filters, winRate: e.target.value })
                    }
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600/70 round-sm
                      bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="all">Any Win Rate</option>
                    <option value="above50">Above 50%</option>
                    <option value="above75">Above 75%</option>
                    <option value="below50">Below 50%</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                    <ChevronLeft className="h-4 w-4 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Trading Experience Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary/70 dark:text-primary-light/70" />
                  Trader Experience
                </label>
                <div className="relative">
                  <select
                    value={filters.tradeCount}
                    onChange={(e) =>
                      setFilters({ ...filters, tradeCount: e.target.value })
                    }
                    className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600/70 round-sm
                      bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="all">Any Experience</option>
                    <option value="beginner">Beginner (1-20 trades)</option>
                    <option value="intermediate">
                      Intermediate (21-100 trades)
                    </option>
                    <option value="advanced">Advanced (101+ trades)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                    <ChevronLeft className="h-4 w-4 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Connections Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary/70 dark:text-primary-light/70" />
                  Connections
                </label>
                <div className="relative h-10 flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.following}
                      onChange={() =>
                        setFilters({
                          ...filters,
                          following: !filters.following,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Show only traders I follow
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results per page & count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={tradersPerPage}
              onChange={(e) => {
                setTradersPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="block pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600/70 round-sm
              bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              appearance-none"
            >
              <option value={6}>6 per page</option>
              <option value={9}>9 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={36}>36 per page</option>
            </select>
            <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <ChevronLeft className="h-4 w-4 rotate-90" />
            </div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            per page
          </span>
        </div>

        {filteredTraders.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 bg-gray-50/80 dark:bg-gray-700/30 px-3 py-2 round-sm">
            <Users className="h-4 w-4" />
            <span>
              Showing {(currentPage - 1) * tradersPerPage + 1}-
              {Math.min(currentPage * tradersPerPage, filteredTraders.length)}{" "}
              of {filteredTraders.length} traders
            </span>
          </div>
        )}
      </div>

      {/* No traders found message */}
      {filteredTraders.length === 0 && (
        <div className="bg-gray-50/80 dark:bg-gray-800/40 rounded-sm border border-gray-200/70 dark:border-gray-700/40 p-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-full mb-4">
            <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No Traders Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? "No traders match your current filters. Try adjusting your filter criteria."
              : searchQuery
              ? "No traders match your search criteria. Try adjusting your search terms."
              : "There are no traders available to display at this time."}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white round-sm shadow text-sm font-medium flex items-center gap-2 mx-auto"
            >
              <X className="h-4 w-4" />
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Traders Grid */}
      {currentTraders.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentTraders.map((trader) => (
              <TraderCard
                key={trader._id}
                trader={trader}
                currentUserId={user._id}
                onFollowToggle={handleFollow}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 round-sm border border-gray-300 dark:border-gray-600/70 
                    bg-white dark:bg-gray-800/60 text-gray-700 dark:text-gray-300
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;

                    // Show first page, last page, and 1 page before and after current page
                    const isFirstPage = pageNumber === 1;
                    const isLastPage = pageNumber === totalPages;
                    const isCurrentPage = pageNumber === currentPage;
                    const isNearCurrentPage =
                      Math.abs(pageNumber - currentPage) <= 1;

                    if (isFirstPage || isLastPage || isNearCurrentPage) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-10 h-10 flex items-center justify-center round-sm transition-colors 
                            ${
                              isCurrentPage
                                ? "bg-primary text-white font-medium"
                                : "bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/70"
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 &&
                        currentPage < totalPages - 2)
                    ) {
                      // Show ellipsis
                      return (
                        <span
                          key={pageNumber}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 round-sm border border-gray-300 dark:border-gray-600/70 
                    bg-white dark:bg-gray-800/60 text-gray-700 dark:text-gray-300
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Traders;
