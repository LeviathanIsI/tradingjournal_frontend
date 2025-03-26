import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAI } from "../../context/AIContext";
import { useTrades } from "../../hooks/useTrades";
import {
  Search,
  Loader,
  TrendingUp,
  ArrowRight,
  Activity,
  Target,
  AlertTriangle,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AIResponseCountdown from "./AIResponseCountdown";
import { useToast } from "../../context/ToastContext";

const CACHE_KEY_PREFIX = "trade-coaching-";

const SmartTradeCoaching = () => {
  const { user } = useAuth();
  const { makeAIRequest, getCachedAnalysis } = useAI();
  const { trades: allTrades } = useTrades(user);
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [tradeAnalysis, setTradeAnalysis] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [estimatedResponseTime, setEstimatedResponseTime] = useState(20);

  // Restore state from localStorage/cache on initial load
  useEffect(() => {
    const storedTradeId = localStorage.getItem("selected-trade-id");
    if (storedTradeId && allTrades?.length > 0) {
      const trade = allTrades.find((t) => t._id === storedTradeId);
      if (trade) {
        setSelectedTrade(trade);

        // Check for cached analysis
        const cacheKey = `${CACHE_KEY_PREFIX}${storedTradeId}`;
        const cachedData = getCachedAnalysis(cacheKey);

        if (cachedData) {
          setTradeAnalysis(cachedData.tradeAnalysis);
        }
      }
    }
  }, [allTrades, getCachedAnalysis]);

  // Save selected trade to localStorage when it changes
  useEffect(() => {
    if (selectedTrade?._id) {
      localStorage.setItem("selected-trade-id", selectedTrade._id);
    }
  }, [selectedTrade]);

  // Memoize filtered trades
  const filteredTrades = useMemo(() => {
    if (!allTrades || allTrades.length === 0) return [];

    return allTrades
      .filter((trade) => {
        const symbol = trade.symbol || trade.ticker || "";
        const notes = trade.notes || "";
        const setup = trade.setup || "";

        return (
          symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          setup.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
  }, [allTrades, searchQuery]);

  const analyzeSelectedTrade = useCallback(async () => {
    if (!selectedTrade) return;

    setAnalyzeLoading(true);

    try {
      // Generate cache key for this analysis
      const cacheKey = `${CACHE_KEY_PREFIX}${selectedTrade._id}`;

      // Check if we have a cached result first
      const cachedData = getCachedAnalysis(cacheKey);
      if (cachedData) {
        setTradeAnalysis(cachedData.tradeAnalysis);
        setAnalyzeLoading(false);
        return;
      }

      const tradeType = selectedTrade.contractType ? "option" : "stock";

      // If no cached result, make the API request
      const data = await makeAIRequest(
        `analyze-trade/${selectedTrade._id}`,
        { type: tradeType },
        cacheKey // Pass cache key to store the result
      );

      if (data.success) {
        setTradeAnalysis(data.tradeAnalysis);
        showToast("Trade analysis completed successfully", "success");
      } else if (!data.isCreditsError) {
        // Only handle non-credit errors
        showToast("Failed to analyze trade. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error analyzing trade:", error);
      if (!error.isCreditsError) {
        showToast("Failed to analyze trade. Please try again.", "error");
      }
    } finally {
      setAnalyzeLoading(false);
    }
  }, [selectedTrade, makeAIRequest, getCachedAnalysis]);

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Smart Trade Coaching
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Trade Selection */}
        <div className="col-span-1 bg-white dark:bg-gray-700/60 round-sm border border-gray-200 dark:border-gray-600/50 shadow-sm p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 
                focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent
                placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[70vh]">
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Select a trade to analyze:
            </h3>

            {filteredTrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No trades found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTrades.map((trade) => (
                  <div
                    key={trade._id}
                    className={`p-3 rounded-sm cursor-pointer transition-colors duration-150 
  hover:bg-gray-50 dark:hover:bg-gray-600/40 border border-transparent ${
    selectedTrade?._id === trade._id
      ? "bg-blue-50 dark:bg-blue-700/30 border border-blue-200 dark:border-blue-700/70"
      : "hover:bg-gray-50 dark:hover:bg-gray-600/40 border border-transparent"
  }`}
                    onClick={() => setSelectedTrade(trade)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {trade.symbol || trade.ticker}
                      </div>
                      <div
                        className={`px-2 py-0.5 text-xs rounded-sm ${
                          trade.profitLoss?.realized > 0
                            ? "bg-green-100 dark:bg-green-700/30 text-green-800 dark:text-green-300"
                            : trade.profitLoss?.realized < 0
                            ? "bg-red-100 dark:bg-red-700/30 text-red-800 dark:text-red-300"
                            : "bg-gray-100 dark:bg-gray-600/40 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {trade.profitLoss?.realized > 0
                          ? "Win"
                          : trade.profitLoss?.realized < 0
                          ? "Loss"
                          : "Open"}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {formatDate(trade.entryDate)}
                    </div>

                    <div className="flex justify-between mt-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          P/L:
                        </span>{" "}
                        <span
                          className={
                            trade.profitLoss?.realized > 0
                              ? "text-green-600 dark:text-green-400"
                              : trade.profitLoss?.realized < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-300"
                          }
                        >
                          {trade.profitLoss
                            ? formatCurrency(trade.profitLoss.realized)
                            : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Setup:
                        </span>{" "}
                        <span className="text-gray-700 dark:text-gray-300">
                          {trade.setup || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Analysis Display */}
        <div className="col-span-1 lg:col-span-2">
          {!selectedTrade ? (
            <div className="bg-white dark:bg-gray-700/60 round-sm border border-gray-200 dark:border-gray-600/50 shadow-sm p-8 text-center">
              <div className="text-gray-500 dark:text-gray-300 mb-2">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-400" />
                <p className="text-lg">
                  Select a trade from the list to get AI analysis
                </p>
                <p className="text-sm mt-2">
                  The AI coach will analyze your entry, exit, risk management
                  and more
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-700/60 round-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
              {/* Trade Summary Header */}
              <div className="border-b border-gray-200 dark:border-gray-600/50 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedTrade.symbol || selectedTrade.ticker} Analysis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedTrade.type}{" "}
                      {selectedTrade.contractType
                        ? `(${selectedTrade.contractType})`
                        : ""}{" "}
                      traded on {formatDate(selectedTrade.entryDate)}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 text-sm rounded-sm font-medium ${
                      selectedTrade.profitLoss?.realized > 0
                        ? "bg-green-100 dark:bg-green-700/30 text-green-800 dark:text-green-300"
                        : selectedTrade.profitLoss?.realized < 0
                        ? "bg-red-100 dark:bg-red-700/30 text-red-800 dark:text-red-300"
                        : "bg-gray-100 dark:bg-gray-600/40 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {selectedTrade.profitLoss?.realized > 0
                      ? `+${formatCurrency(selectedTrade.profitLoss.realized)}`
                      : formatCurrency(selectedTrade.profitLoss?.realized || 0)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-gray-50 dark:bg-gray-600/30 p-2 rounded-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Entry
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(selectedTrade.entryPrice)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-600/30 p-2 rounded-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Exit
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTrade.exitPrice
                        ? formatCurrency(selectedTrade.exitPrice)
                        : "Open"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-600/30 p-2 rounded-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Stop Loss
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTrade.stopLoss
                        ? formatCurrency(selectedTrade.stopLoss)
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-600/30 p-2 rounded-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Target
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTrade.target
                        ? formatCurrency(selectedTrade.target)
                        : "-"}
                    </p>
                  </div>
                </div>
                {/* Analyze Trade Button - Moved Below Trade Details & Centered */}
                <div className="mt-6 flex justify-center">
                  <button
                    className="py-3 px-6 bg-blue-600 dark:bg-blue-600/90 text-white rounded-sm text-lg font-medium 
  hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
  transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    onClick={analyzeSelectedTrade}
                    disabled={!selectedTrade || analyzeLoading}
                  >
                    {analyzeLoading ? (
                      <>
                        <Loader className="animate-spin h-5 w-5" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-5 w-5" />
                        <span>Analyze Trade</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Analysis Content */}
              <div className="p-6">
                {analyzeLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="animate-spin h-10 w-10 text-blue-500 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      AI is analyzing your trade...
                    </p>
                    <AIResponseCountdown
                      isLoading={analyzeLoading}
                      estimatedTime={estimatedResponseTime}
                    />
                  </div>
                ) : tradeAnalysis ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ node, ...props }) => {
                          // Choose icon based on section title
                          let Icon = Activity;
                          const content = props.children?.toString() || "";

                          if (content.includes("Entry")) Icon = TrendingUp;
                          if (content.includes("Exit")) Icon = ArrowRight;
                          if (content.includes("Risk")) Icon = AlertTriangle;
                          if (content.includes("Trade Plan")) Icon = BookOpen;
                          if (content.includes("Key Takeaways"))
                            Icon = Lightbulb;

                          return (
                            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-6 mb-3 flex items-center border-l-2 border-blue-500 dark:border-blue-400 pl-3">
                              <Icon className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-300" />
                              {props.children}
                            </h2>
                          );
                        },
                        p: ({ node, ...props }) => (
                          <p className="text-gray-700 dark:text-gray-300 mb-4 ml-4 leading-relaxed">
                            {props.children}
                          </p>
                        ),
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
                      {tradeAnalysis}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                    <div className="mb-4">
                      <Lightbulb className="h-12 w-12 mx-auto text-blue-400 dark:text-blue-400" />
                    </div>
                    <p className="text-lg">
                      Click "Analyze Trade" to get AI coaching insights
                    </p>
                    <p className="text-sm mt-2">
                      The AI will review your entry, exit timing, risk
                      management, and provide actionable feedback
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartTradeCoaching;
