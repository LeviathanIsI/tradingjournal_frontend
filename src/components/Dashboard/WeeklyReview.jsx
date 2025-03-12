import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAI } from "../../context/AIContext";
import { useTrades } from "../../hooks/useTrades";
import { useToast } from "../../context/ToastContext";
import {
  Calendar,
  Loader,
  BarChart,
  TrendingUp,
  TrendingDown,
  LightbulbIcon,
  Award,
  ChevronRight,
  Target,
  BarChart2,
  LineChart,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AIResponseCountdown from "./AIResponseCountdown";

const CACHE_KEY_PREFIX = "weekly-review-";

const WeeklyReview = () => {
  const { user } = useAuth();
  const {
    makeAIRequest,
    getCachedAnalysis,
    clearCachedAnalysis,
    clearCacheWithPrefix,
  } = useAI();
  const { showToast } = useToast();
  const { trades, fetchTradesForWeek } = useTrades(user);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    return localStorage.getItem("selected-week") || null;
  });
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [estimatedResponseTime] = useState(20);

  // Use refs to track initialization and prevent infinite loops
  const isInitialized = useRef(false);
  const isFetchingTrades = useRef(false);
  const previousSelectedWeek = useRef(selectedWeek);

  // Force reset all states
  const resetComponent = useCallback(() => {
    // Clear all states
    setLoading(false);
    setAiAnalysis(null);
    setReviewData(null);

    // Clear the specific cache key if we have a selectedWeek
    if (selectedWeek) {
      const cacheKey = `${CACHE_KEY_PREFIX}${selectedWeek}`;
      clearCachedAnalysis(cacheKey);

      // Also clear localStorage for this week
      localStorage.removeItem("selected-week");
    }

    // If available, clear all weekly review caches
    if (clearCacheWithPrefix) {
      clearCacheWithPrefix(CACHE_KEY_PREFIX);
    }

    // Reset refs
    isInitialized.current = false;
    isFetchingTrades.current = false;

    // Clear selected week last to avoid triggering another render cycle
    setSelectedWeek(null);

    // Show toast to confirm reset
    showToast("Analysis reset successfully", "success");
  }, [selectedWeek, clearCachedAnalysis, clearCacheWithPrefix, showToast]);

  // Initialize from cache once
  useEffect(() => {
    if (isInitialized.current) return;

    const initializeFromCache = async () => {
      isInitialized.current = true;

      if (selectedWeek) {
        try {
          // Check for cached analysis
          const cacheKey = `${CACHE_KEY_PREFIX}${selectedWeek}`;
          const cachedData = getCachedAnalysis(cacheKey);

          if (cachedData && cachedData.analysis) {
            setAiAnalysis(cachedData.analysis);
          }
        } catch (error) {
          console.error("Error initializing from cache:", error);
          // If there's an error with the cache, reset it
          clearCachedAnalysis(`${CACHE_KEY_PREFIX}${selectedWeek}`);
        }
      }
    };

    initializeFromCache();
  }, [selectedWeek, getCachedAnalysis, clearCachedAnalysis]);

  // Save selected week to localStorage when it changes
  useEffect(() => {
    if (selectedWeek) {
      localStorage.setItem("selected-week", selectedWeek);
    }
  }, [selectedWeek]);

  // When selectedWeek changes, fetch trade data - but ONLY when it actually changes
  useEffect(() => {
    // Skip if no selected week or if already fetching
    if (!selectedWeek || isFetchingTrades.current) return;

    // Skip if the selected week hasn't actually changed (prevents needless refetching)
    if (selectedWeek === previousSelectedWeek.current) return;

    // Update the ref to track the current value
    previousSelectedWeek.current = selectedWeek;

    const fetchData = async () => {
      try {
        // Set flag first to prevent concurrent fetches
        isFetchingTrades.current = true;
        setLoading(true);

        const data = await fetchTradesForWeek(selectedWeek);
        if (data) {
          setReviewData(data);
        }
      } catch (error) {
        console.error("Error fetching trades:", error);
        clearCachedAnalysis(`${CACHE_KEY_PREFIX}${selectedWeek}`);

        // Show toast for trade fetch errors
        showToast("Failed to fetch trade data for the selected week");
      } finally {
        // Always clear the flag when done, regardless of success/failure
        isFetchingTrades.current = false;
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedWeek, fetchTradesForWeek, clearCachedAnalysis, showToast]);

  const handleStartReport = useCallback(async () => {
    if (!selectedWeek) return;

    try {
      setLoading(true);
      setAiAnalysis(null);

      // Generate cache key for this analysis
      const cacheKey = `${CACHE_KEY_PREFIX}${selectedWeek}`;

      // Check if we have a cached result first
      const cachedData = getCachedAnalysis(cacheKey);
      if (cachedData && cachedData.analysis) {
        setAiAnalysis(cachedData.analysis);
        setLoading(false);
        return;
      }

      // If no cached result, make the API request
      // Note: makeAIRequest now handles credit limit errors internally and shows toasts
      const data = await makeAIRequest(
        "analyze-week",
        { week: selectedWeek },
        cacheKey // Pass cache key to store the result
      );

      if (data && data.success && data.analysis) {
        setAiAnalysis(data.analysis);
        // Show success toast
        showToast("Analysis generated successfully", "success");
      } else if (!data.isCreditsError) {
        throw new Error("Failed to get analysis from AI");
      }
    } catch (error) {
      console.error("Error generating AI report:", error);

      // On error, clear the cache but don't fully reset
      clearCachedAnalysis(`${CACHE_KEY_PREFIX}${selectedWeek}`);

      // Only show error toast if it's not already handled as a credits error
      if (!error.isCreditsError) {
        showToast("Failed to generate analysis. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    selectedWeek,
    getCachedAnalysis,
    makeAIRequest,
    clearCachedAnalysis,
    showToast,
  ]);

  // Handle week selection
  const handleWeekChange = (e) => {
    const newWeek = e.target.value;
    if (newWeek !== selectedWeek) {
      // Clear analysis when changing weeks
      setAiAnalysis(null);
      setReviewData(null);
      setSelectedWeek(newWeek);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-md shadow-md border border-gray-200 dark:border-gray-700/60">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-blue-400 mb-4 border-b border-gray-200 dark:border-gray-700/40 pb-2 flex items-center justify-between">
        <div className="flex items-center">
          <BarChart className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />{" "}
          AI Trading Analysis
        </div>
        <button
          onClick={resetComponent}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center transition-colors"
          title="Reset analysis"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reset
        </button>
      </h2>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label htmlFor="week" className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span>Select Week:</span>
        </label>
        <input
          type="week"
          id="week"
          value={selectedWeek || ""}
          onChange={handleWeekChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
        />
        <button
          className="px-4 py-2 bg-blue-600 dark:bg-blue-600/90 text-white rounded-md 
          hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
          onClick={handleStartReport}
          disabled={loading || !selectedWeek}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader className="animate-spin h-4 w-4" />
              <span>Analyzing...</span>
            </div>
          ) : (
            "Generate AI Analysis"
          )}
        </button>
      </div>

      {loading && !aiAnalysis && (
        <div className="bg-white dark:bg-gray-800/60 rounded-md shadow-md p-8 border border-gray-200 dark:border-gray-700/60">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="animate-spin h-10 w-10 text-blue-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Analyzing your trading week...
            </p>
            <AIResponseCountdown
              isLoading={loading}
              estimatedTime={estimatedResponseTime}
            />
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="mt-6 p-6 border border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-700/30 rounded-md">
          <div className="pb-6">
            {(() => {
              try {
                return (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => {
                        // Default icon
                        let Icon = BarChart2;

                        // Content-based icon selection
                        const content = props.children?.toString() || "";
                        if (content.includes("Overall Analysis"))
                          Icon = BarChart2;
                        if (content.includes("Patterns")) Icon = LineChart;
                        if (content.includes("Suggestions"))
                          Icon = LightbulbIcon;
                        if (content.includes("What They Did Well"))
                          Icon = Award;
                        if (content.includes("Risk Management"))
                          Icon = AlertTriangle;
                        if (content.includes("Recommendations")) Icon = Target;

                        return (
                          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-8 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700/40 flex items-center">
                            <Icon className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />{" "}
                            {props.children}
                          </h1>
                        );
                      },
                      h2: ({ node, ...props }) => {
                        // Default icon
                        let Icon = TrendingUp;

                        // Content-based icon selection
                        const content = props.children?.toString() || "";
                        if (content.includes("Overall Analysis"))
                          Icon = BarChart2;
                        if (content.includes("Patterns")) Icon = LineChart;
                        if (content.includes("Suggestions"))
                          Icon = LightbulbIcon;
                        if (content.includes("What They Did Well"))
                          Icon = Award;
                        if (content.includes("Risk Management"))
                          Icon = AlertTriangle;
                        if (content.includes("Recommendations")) Icon = Target;

                        return (
                          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-6 mb-3 flex items-center border-l-2 border-blue-600 dark:border-blue-500 pl-3">
                            <Icon className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-300" />{" "}
                            {props.children}
                          </h2>
                        );
                      },
                      h3: ({ node, ...props }) => {
                        // Default icon
                        let Icon = ChevronRight;

                        // Content-based icon selection
                        const content = props.children?.toString() || "";
                        if (content.includes("Winning")) Icon = TrendingUp;
                        if (content.includes("Losing")) Icon = TrendingDown;
                        if (content.includes("Risk")) Icon = AlertTriangle;
                        if (content.includes("Success")) Icon = CheckCircle;
                        if (content.includes("Trade Analysis"))
                          Icon = LineChart;
                        if (content.includes("Diversification"))
                          Icon = BarChart;

                        return (
                          <h3 className="text-lg font-medium text-blue-500 dark:text-blue-200 mt-4 mb-2 flex items-center pl-2">
                            <Icon className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-200" />{" "}
                            {props.children}
                          </h3>
                        );
                      },
                      p: ({ node, ...props }) => {
                        const content = props.children?.toString() || "";
                        const isSummaryParagraph =
                          content.startsWith("Overall,") ||
                          content.includes("summary") ||
                          content.includes("conclusion");

                        return (
                          <p
                            className={`text-gray-700 dark:text-gray-300 ml-4 leading-relaxed
                            ${isSummaryParagraph ? "mt-6 mb-6" : "mb-4"}`}
                          >
                            {props.children}
                          </p>
                        );
                      },
                      ul: ({ node, ...props }) => (
                        <ul className="pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                          {props.children}
                        </ul>
                      ),
                      li: ({ node, ...props }) => (
                        <li className="text-gray-700 dark:text-gray-300 mb-2 flex items-start">
                          <span className="text-blue-500 dark:text-blue-400 mr-2 mt-1">
                            •
                          </span>
                          <span className="flex-1">{props.children}</span>
                        </li>
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold text-gray-900 dark:text-white">
                          {props.children}
                        </strong>
                      ),
                    }}
                  >
                    {aiAnalysis}
                  </ReactMarkdown>
                );
              } catch (error) {
                console.error("ReactMarkdown rendering error:", error);
                showToast("Error rendering analysis content");
                return (
                  <div className="text-red-600 dark:text-red-400">
                    <p>Error rendering markdown. See console for details.</p>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700/40 rounded-md text-xs overflow-auto border border-gray-200 dark:border-gray-700/60">
                      {aiAnalysis}
                    </pre>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}

      {!loading && !reviewData && !aiAnalysis && (
        <div className="mt-8 text-center text-gray-500 dark:text-gray-300">
          <p>
            Select a week and click "Generate AI Analysis" to see AI-powered
            insights for your trading week
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyReview;
