import { useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTrades } from "../../hooks/useTrades";
import { useAI } from "../../context/AIContext";
import {
  Search,
  Loader,
  Clock,
  DollarSign,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart,
  BarChart2,
  Lightbulb,
  HelpCircle,
  ArrowRightCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AIResponseCountdown from "./AIResponseCountdown";
import { useToast } from "../../context/ToastContext";

const SCENARIOS = [
  {
    id: "optimal-exit",
    label: "Optimal Exit Point",
    description: "What if you had exited at the most profitable point?",
    icon: Target,
  },
  {
    id: "longer-hold",
    label: "Longer Holding Period",
    description: "What if you had held the position twice as long?",
    icon: Clock,
  },
  {
    id: "tighter-stop",
    label: "Tighter Stop Loss",
    description: "What if your stop loss was 50% closer to entry?",
    icon: TrendingDown,
  },
  {
    id: "wider-stop",
    label: "Wider Stop Loss",
    description: "What if your stop loss was 50% further from entry?",
    icon: AlertTriangle,
  },
  {
    id: "different-entry",
    label: "Alternative Entry",
    description: "What if you had waited for a better entry point?",
    icon: TrendingUp,
  },
];

const PredictiveAnalysis = () => {
  const { user, updateAILimits } = useAuth();
  const { trades: allTrades } = useTrades(user);
  const { makeAIRequest, getCachedAnalysis, clearCachedAnalysis } = useAI();
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [analysis, setAnalysis] = useState(null);
  const [tradeDetails, setTradeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [estimatedResponseTime, setEstimatedResponseTime] = useState(25);

  // Filter trades based on search query
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

  // Generate predictive analysis
  const analyzeTrade = useCallback(async () => {
    if (!selectedTrade || !selectedScenario) return;

    setLoading(true);
    setAnalysisStarted(true);
    setAnalysis(null);
    setError(null);

    try {
      const tradeType = selectedTrade.contractType ? "option" : "stock";

      // Use makeAIRequest instead of direct fetch
      const data = await makeAIRequest("predictive-analysis", {
        tradeId: selectedTrade._id,
        type: tradeType,
        scenario: selectedScenario.id,
      });

      if (data && data.success) {
        setAnalysis(data.analysis);
        setTradeDetails(data.tradeDetails);
        showToast("Analysis completed successfully", "success");

        // AIContext automatically handles updating AI limits if they're in the response
      } else if (data && data.isCreditsError) {
        // Credit limit errors are already handled by makeAIRequest
        // Just reset the UI state
        setAnalysisStarted(false);
      } else {
        // Handle other errors
        setError(data?.error || "Failed to analyze trade scenarios");
        showToast("Failed to analyze trade scenarios", "error");
      }
    } catch (error) {
      console.error("Error generating prediction:", error);
      if (!error.isCreditsError) {
        const errorMsg = error.message || "An unexpected error occurred";
        setError(errorMsg);
        showToast(errorMsg, "error");
      }
      setAnalysisStarted(false);
    } finally {
      setLoading(false);
    }
  }, [selectedTrade, selectedScenario, makeAIRequest, showToast]);

  // Reset analysis
  const resetAnalysis = () => {
    setAnalysis(null);
    setTradeDetails(null);
    setError(null);
    setAnalysisStarted(false);
  };

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

  const processMarkdown = (markdown) => {
    if (!markdown) return "";

    return markdown
      .replace(/\* •\n/g, "* ")
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\\times/g, "×")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
      .replace(/\\approx/g, "≈")
      .replace(
        /\[\s*P\/L\s*=\s*\(([^)]+)\)\s*×\s*([^]]+)\]/g,
        "P/L = ($1) × $2"
      )
      .replace(
        /\[\s*P\/L\s*=\s*\(([^)]+)\)\s*×\s*(\d+)\s*=\s*([^]]+)\]/g,
        "P/L = ($1) × $2 = $3"
      )
      .replace(/\$(\d+\.\d+)\/\$(\d+\.\d+)/g, "$$$1/$$$2")
      .replace(/\$\$([^$]+)\$\$/g, "$$$1")
      .replace(/\$(\d+\.\d+)\$/g, "$$$1")
      .replace(/(\d+)≈(\d+)/g, "$1 ≈ $2")
      .replace(/(\$\d+\.\d+)\/-(\d+\.\d+)≈\$(\d+\.\d+)\$/g, "$1 ÷ -$2 ≈ $$$3");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="flex items-center text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        <div className="h-6 w-1.5 bg-primary rounded-full mr-3"></div>
        Predictive Trade Analysis
      </h2>

      {!analysisStarted && (
        <div className="bg-gradient-to-br from-white/95 to-gray-50/90 dark:from-gray-800/60 dark:to-gray-700/50 rounded-sm shadow-sm p-8 text-center mb-6 border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
          <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-3 font-medium">
            Discover Alternative Trade Outcomes
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Select a trade and scenario to see what could have happened with
            different entry, exit, or risk management strategies
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Trade Selection */}
        <div className="lg:col-span-1 bg-white/90 dark:bg-gray-800/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <div className="h-4 w-1 bg-secondary rounded-full mr-2"></div>
              Select a trade to analyze:
            </h3>

            <div className="overflow-y-auto max-h-[55vh] pr-1">
              {filteredTrades.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/20 rounded-sm border border-dashed border-gray-300 dark:border-gray-600/50">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No trades found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTrades.map((trade) => (
                    <div
                      key={trade._id}
                      className={`p-3 round-sm cursor-pointer transition-all duration-150 
                      hover:bg-gray-50 dark:hover:bg-gray-700/40 border ${
                        selectedTrade?._id === trade._id
                          ? "bg-primary/5 dark:bg-primary/10 border-primary/30 dark:border-primary/40 shadow-sm"
                          : "border-gray-200 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => setSelectedTrade(trade)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {trade.symbol || trade.ticker}
                        </div>
                        <div
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            trade.profitLoss?.realized > 0
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : trade.profitLoss?.realized < 0
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              : "bg-gray-100 dark:bg-gray-700/40 text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {trade.profitLoss?.realized > 0
                            ? "Win"
                            : trade.profitLoss?.realized < 0
                            ? "Loss"
                            : "Open"}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : trade.profitLoss?.realized < 0
                                ? "text-red-600 dark:text-red-400 font-medium"
                                : "text-gray-600 dark:text-gray-400"
                            }
                          >
                            {trade.profitLoss
                              ? formatCurrency(trade.profitLoss.realized)
                              : "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Type:
                          </span>{" "}
                          <span className="text-gray-700 dark:text-gray-300">
                            {trade.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Analysis Display with Integrated Scenario Selection */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm shadow-sm p-8 border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="animate-spin h-10 w-10 text-primary mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Running predictive analysis...
                </p>
                <AIResponseCountdown
                  isLoading={loading}
                  estimatedTime={estimatedResponseTime}
                />
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50/90 dark:bg-red-900/20 p-6 rounded-sm border border-red-200 dark:border-red-800/50 shadow-sm text-red-600 dark:text-red-300 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Analysis Error</h3>
              </div>
              <p>{error}</p>
              <button
                onClick={resetAnalysis}
                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 round-sm hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !selectedTrade ? (
            <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-lg">Select a trade from the list</p>
                <p className="text-sm mt-2">
                  Choose a trade to see alternative outcomes and "what if"
                  scenarios
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              {/* Scenario Selection moved here - prominently displayed */}
              <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm shadow-sm p-5 border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-700/70 pb-2 flex items-center">
                  <div className="h-4 w-1 bg-accent rounded-full mr-2"></div>
                  Select analysis scenario:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      className={`w-full text-left p-3 round-sm flex items-start transition-all ${
                        selectedScenario.id === scenario.id
                          ? "bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 shadow-sm"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/40 border border-gray-200 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => setSelectedScenario(scenario)}
                    >
                      <scenario.icon className="w-5 h-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {scenario.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {scenario.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  className="w-full mt-4 py-2.5 px-4 bg-primary hover:bg-primary/90 text-white round-sm
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow hover:shadow-md
                  disabled:shadow-none flex items-center justify-center"
                  onClick={analyzeTrade}
                  disabled={!selectedTrade || !selectedScenario || loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Zap className="h-5 w-5 mr-2" />
                      <span>Run Predictive Analysis</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Analysis Content */}
              {!analysis ? (
                <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">
                    <ArrowRightCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="text-lg">
                      {selectedScenario
                        ? selectedScenario.label
                        : "Select a scenario"}
                    </p>
                    <p className="text-sm mt-2">
                      Click 'Run Predictive Analysis' to see what could have
                      happened
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 dark:bg-gray-800/60 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
                  {/* Analysis Header */}
                  <div className="border-b border-gray-200 dark:border-gray-700/70 pb-4 px-6 pt-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                          <selectedScenario.icon className="mr-3 h-6 w-6 text-primary" />
                          {selectedScenario.label}: {tradeDetails?.symbol}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedScenario.description}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-1.5 text-sm rounded-full font-medium ${
                          tradeDetails?.profitLoss > 0
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {tradeDetails?.profitLoss > 0
                          ? `+${formatCurrency(tradeDetails.profitLoss)}`
                          : formatCurrency(tradeDetails?.profitLoss || 0)}
                      </div>
                    </div>

                    {tradeDetails && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gray-50/80 dark:bg-gray-700/30 p-3 round-sm shadow-sm border border-gray-200/70 dark:border-gray-600/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Entry
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(tradeDetails.entryPrice)}
                          </p>
                        </div>
                        <div className="bg-gray-50/80 dark:bg-gray-700/30 p-3 round-sm shadow-sm border border-gray-200/70 dark:border-gray-600/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Exit
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {tradeDetails.exitPrice
                              ? formatCurrency(tradeDetails.exitPrice)
                              : "Open"}
                          </p>
                        </div>
                        <div className="bg-gray-50/80 dark:bg-gray-700/30 p-3 round-sm shadow-sm border border-gray-200/70 dark:border-gray-600/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Trade Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {tradeDetails.tradeType}
                          </p>
                        </div>
                        <div className="bg-gray-50/80 dark:bg-gray-700/30 p-3 round-sm shadow-sm border border-gray-200/70 dark:border-gray-600/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Holding Time
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {tradeDetails.holdingTime} hrs
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analysis Content */}
                  <div className="p-6">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ node, ...props }) => {
                            // Choose icon based on section title
                            let Icon = BarChart;
                            const content = props.children?.toString() || "";

                            if (content.includes("Alternative Outcome"))
                              Icon = Zap;
                            if (content.includes("Market Context"))
                              Icon = BarChart2;
                            if (content.includes("Probability")) Icon = Target;
                            if (content.includes("Strategic")) Icon = Lightbulb;
                            if (content.includes("Risk Management"))
                              Icon = AlertTriangle;

                            return (
                              <h2 className="text-xl font-semibold text-primary dark:text-primary/90 mt-6 mb-3 flex items-center border-l-2 border-primary dark:border-primary/80 pl-3">
                                <Icon className="mr-2 h-5 w-5 text-primary dark:text-primary/90" />
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
                              <span className="text-primary dark:text-primary/80 mr-2 mt-1">
                                •
                              </span>
                              <span className="flex-1">{props.children}</span>
                            </li>
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">
                              {props.children}
                            </strong>
                          ),
                        }}
                      >
                        {processMarkdown(analysis)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis;
