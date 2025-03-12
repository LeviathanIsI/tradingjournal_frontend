import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Eye,
  EyeOff,
  Edit,
  MessageCircle,
  Heart,
  Trash2,
  Loader,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
} from "lucide-react";
import ReviewModal from "./ReviewModal";

const YourReviews = ({ userId }) => {
  const { user } = useAuth();
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isOwnProfile = user?._id === userId;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(4);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    profitType: "all", // 'profit', 'loss', 'all'
    dateRange: "all", // 'week', 'month', 'year', 'all'
    isFilterOpen: false,
  });

  const [editData, setEditData] = useState({
    lessonLearned: "",
    whatWentWell: "",
    whatWentWrong: "",
    futureAdjustments: "",
    isPublic: false,
  });

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  // Apply filters when filters change or all reviews change
  useEffect(() => {
    applyFilters();
  }, [filters.search, filters.profitType, filters.dateRange, allReviews]);

  // Update pagination when filtered reviews change
  useEffect(() => {
    const totalFilteredReviews = filteredReviews.length;
    setTotalPages(
      Math.max(1, Math.ceil(totalFilteredReviews / reviewsPerPage))
    );

    // Reset to page 1 if current page exceeds total pages
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }

    updateDisplayedReviews();
  }, [filteredReviews, reviewsPerPage, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch reviews");
      }

      const fetchedReviews = data.data.filter((review) =>
        isOwnProfile
          ? review.user._id === userId
          : review.isPublic && review.user._id === userId
      );

      setAllReviews(fetchedReviews);
      setFilteredReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter the reviews based on search and filters
  const applyFilters = () => {
    let result = [...allReviews];

    // Apply search filter
    if (filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (review) =>
          review.trade.symbol.toLowerCase().includes(searchTerm) ||
          review.lessonLearned.toLowerCase().includes(searchTerm) ||
          review.whatWentWell.toLowerCase().includes(searchTerm) ||
          review.whatWentWrong.toLowerCase().includes(searchTerm) ||
          (review.futureAdjustments &&
            review.futureAdjustments.toLowerCase().includes(searchTerm))
      );
    }

    // Apply profit/loss filter
    if (filters.profitType === "profit") {
      result = result.filter((review) => review.trade.profitLoss.realized >= 0);
    } else if (filters.profitType === "loss") {
      result = result.filter((review) => review.trade.profitLoss.realized < 0);
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let cutoffDate = new Date();

      if (filters.dateRange === "week") {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (filters.dateRange === "month") {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (filters.dateRange === "year") {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }

      result = result.filter(
        (review) => new Date(review.createdAt) >= cutoffDate
      );
    }

    setFilteredReviews(result);
  };

  // Update displayed reviews based on current page
  const updateDisplayedReviews = () => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    setDisplayedReviews(filteredReviews.slice(startIndex, endIndex));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      profitType: "all",
      dateRange: "all",
      isFilterOpen: false,
    });
  };

  const handleEditClick = (review) => {
    setEditData({
      lessonLearned: review.lessonLearned || "",
      whatWentWell: review.whatWentWell || "",
      whatWentWrong: review.whatWentWrong || "",
      futureAdjustments: review.futureAdjustments || "",
      isPublic: review.isPublic || false,
    });
    setIsEditModalOpen(true);
    setSelectedReview(review);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      // Remove the review from both all reviews and filtered reviews
      setAllReviews(allReviews.filter((review) => review._id !== reviewId));
      setFilteredReviews(
        filteredReviews.filter((review) => review._id !== reviewId)
      );
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleVisibilityToggle = async (review) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${review._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            isPublic: !review.isPublic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update review visibility");
      }

      const data = await response.json();

      // Update both all reviews and filtered reviews
      setAllReviews(
        allReviews.map((r) => (r._id === review._id ? data.data : r))
      );
      setFilteredReviews(
        filteredReviews.map((r) => (r._id === review._id ? data.data : r))
      );
    } catch (error) {
      console.error("Error updating review visibility:", error);
    }
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trade-reviews/${
          selectedReview._id
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Update both all reviews and filtered reviews
        setAllReviews(
          allReviews.map((r) => (r._id === selectedReview._id ? data.data : r))
        );
        setFilteredReviews(
          filteredReviews.map((r) =>
            r._id === selectedReview._id ? data.data : r
          )
        );
        setIsEditModalOpen(false);
        setSelectedReview(null);
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle pagination page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-200 dark:border-gray-700 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex items-center space-x-1">{renderPageNumbers()}</div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-200 dark:border-gray-700 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    );
  };

  // Generate page number buttons
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    // Logic to show current page, some pages before and after, and ellipsis
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(renderPageButton(i));
      }
    } else {
      // Always show first page
      pageNumbers.push(renderPageButton(1));

      // Calculate start and end of visible page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust for edge cases
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis before visible range if needed
      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="ellipsis1"
            className="px-2 text-gray-500 dark:text-gray-400"
          >
            ...
          </span>
        );
      }

      // Add visible page range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(renderPageButton(i));
      }

      // Add ellipsis after visible range if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span
            key="ellipsis2"
            className="px-2 text-gray-500 dark:text-gray-400"
          >
            ...
          </span>
        );
      }

      // Always show last page
      pageNumbers.push(renderPageButton(totalPages));
    }

    return pageNumbers;
  };

  // Render individual page button
  const renderPageButton = (pageNum) => (
    <button
      key={pageNum}
      onClick={() => handlePageChange(pageNum)}
      className={`w-8 h-8 rounded-md text-sm font-medium ${
        currentPage === pageNum
          ? "bg-primary text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {pageNum}
    </button>
  );

  // Filter toggle button
  const renderFilterToggle = () => (
    <button
      onClick={() =>
        setFilters({ ...filters, isFilterOpen: !filters.isFilterOpen })
      }
      className={`p-2 rounded-md border border-gray-200 dark:border-gray-700 
                flex items-center gap-1.5 ${
                  filters.isFilterOpen
                    ? "bg-primary/10 border-primary/50"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
    >
      <Filter
        className={`h-4 w-4 ${
          filters.isFilterOpen
            ? "text-primary"
            : "text-gray-600 dark:text-gray-300"
        }`}
      />
      <span
        className={`text-sm ${
          filters.isFilterOpen
            ? "text-primary font-medium"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        Filter
      </span>
    </button>
  );

  // Filter panel
  const renderFilterPanel = () => {
    if (!filters.isFilterOpen) return null;

    return (
      <div className="mt-3 mb-5 p-4 bg-white/90 dark:bg-gray-800/80 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter Reviews
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="text-xs text-primary dark:text-primary-light flex items-center gap-1 hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search input with label to match other inputs */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600/70 
                      px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-sm"
              />
            </div>
          </div>

          {/* Profit/Loss filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Profit/Loss
            </label>
            <select
              value={filters.profitType}
              onChange={(e) =>
                setFilters({ ...filters, profitType: e.target.value })
              }
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600/70 
                      px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-sm"
            >
              <option value="all">All Trades</option>
              <option value="profit">Profitable Trades</option>
              <option value="loss">Loss Trades</option>
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Time Period
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters({ ...filters, dateRange: e.target.value })
              }
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600/70 
                      px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-sm"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Active filters indicators
  const renderActiveFilters = () => {
    const activeFilters = [];

    if (filters.search) {
      activeFilters.push(
        <div
          key="search"
          className="bg-primary/10 text-primary dark:text-primary-light px-2.5 py-1 rounded-full text-xs flex items-center gap-1"
        >
          <Search className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{filters.search}</span>
          <button
            onClick={() => setFilters({ ...filters, search: "" })}
            className="ml-1 hover:text-primary-dark"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }

    if (filters.profitType !== "all") {
      activeFilters.push(
        <div
          key="profit"
          className="bg-primary/10 text-primary dark:text-primary-light px-2.5 py-1 rounded-full text-xs flex items-center gap-1"
        >
          {filters.profitType === "profit" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{filters.profitType === "profit" ? "Profitable" : "Loss"}</span>
          <button
            onClick={() => setFilters({ ...filters, profitType: "all" })}
            className="ml-1 hover:text-primary-dark"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }

    if (filters.dateRange !== "all") {
      const labels = {
        week: "Last 7 Days",
        month: "Last Month",
        year: "Last Year",
      };

      activeFilters.push(
        <div
          key="date"
          className="bg-primary/10 text-primary dark:text-primary-light px-2.5 py-1 rounded-full text-xs flex items-center gap-1"
        >
          <Calendar className="h-3 w-3" />
          <span>{labels[filters.dateRange]}</span>
          <button
            onClick={() => setFilters({ ...filters, dateRange: "all" })}
            className="ml-1 hover:text-primary-dark"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }

    if (activeFilters.length === 0) return null;

    return (
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Active filters:
        </span>
        {activeFilters}

        <button
          onClick={resetFilters}
          className="text-xs text-primary dark:text-primary-light hover:underline ml-1"
        >
          Clear all
        </button>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-6 text-gray-600 dark:text-gray-300">
        <Loader className="h-5 w-5 mr-2 animate-spin" />
        <span>Loading reviews...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center p-6 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-800/30">
        Error: {error}
      </div>
    );

  if (!allReviews.length)
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white/90 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/40 text-center space-y-3 backdrop-blur-sm shadow-sm">
        <p className="text-lg text-gray-700 dark:text-gray-200">
          No reviews yet
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {isOwnProfile
            ? "Start reviewing your trades to track your progress and improve your trading strategy!"
            : "This trader hasn't published any reviews yet."}
        </p>
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Filter controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {renderFilterToggle()}
          {/* Results count */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredReviews.length}{" "}
            {filteredReviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Pagination size control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
          <select
            value={reviewsPerPage}
            onChange={(e) => setReviewsPerPage(Number(e.target.value))}
            className="block rounded-md border border-gray-300 dark:border-gray-600/70 
                      px-2 py-1 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-sm"
          >
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
        </div>
      </div>

      {renderFilterPanel()}

      {renderActiveFilters()}

      {filteredReviews.length === 0 ? (
        <div className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-6 border border-gray-200 dark:border-gray-700/40 text-center backdrop-blur-sm shadow-sm">
          <p className="text-gray-700 dark:text-gray-300">
            No reviews match your filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 text-primary dark:text-primary-light text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-5">
            {displayedReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white/90 dark:bg-gray-800/80 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {review.trade.symbol} - {review.trade.type}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVisibilityToggle(review)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-md transition-colors"
                        title={review.isPublic ? "Make Private" : "Make Public"}
                      >
                        {review.isPublic ? (
                          <Eye className="h-5 w-5 text-green-500" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditClick(review)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-md transition-colors"
                        title="Edit Review"
                      >
                        <Edit className="h-5 w-5 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-md transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                  <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md border border-gray-200/70 dark:border-gray-600/30">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <div className="h-4 w-1 bg-green-500 rounded-full mr-2"></div>
                      What Went Well
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {review.whatWentWell}
                    </p>
                  </div>
                  <div className="bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md border border-gray-200/70 dark:border-gray-600/30">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <div className="h-4 w-1 bg-red-500 rounded-full mr-2"></div>
                      What Went Wrong
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {review.whatWentWrong}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md border border-gray-200/70 dark:border-gray-600/30">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <div className="h-4 w-1 bg-primary rounded-full mr-2"></div>
                      Lessons Learned
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {review.lessonLearned}
                    </p>
                  </div>
                  {review.futureAdjustments && (
                    <div className="col-span-1 sm:col-span-2 bg-gray-50/80 dark:bg-gray-700/30 p-4 rounded-md border border-gray-200/70 dark:border-gray-600/30">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <div className="h-4 w-1 bg-blue-500 rounded-full mr-2"></div>
                        Future Adjustments
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {review.futureAdjustments}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200 dark:border-gray-700/40">
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                    <div className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
                      <Heart className="h-4 w-4" />
                      <span>{review.likes?.length || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
                      <MessageCircle className="h-4 w-4" />
                      <span>{review.comments?.length || 0} comments</span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      review.trade.profitLoss.realized >= 0
                        ? "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {formatCurrency(review.trade.profitLoss.realized)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {selectedReview && (
        <ReviewModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedReview(null);
          }}
          trade={selectedReview.trade}
          review={selectedReview}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default YourReviews;
