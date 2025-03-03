import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAI } from "../context/AIContext";
import { useTrades } from "../hooks/useTrades";
import {
  Search,
  Loader,
  ClipboardList,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart2,
  LineChart,
  Lightbulb,
  Film,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Camera,
  MousePointer,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Maximize2,
  PieChart,
  History,
  Compass,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AIResponseCountdown from "./AIResponseCountdown";
import { useToast } from "../context/ToastContext";

const getEstimatedResponseTime = (tradeType, holdingTimeMs) => {
  let estimatedTime = 30;

  if (tradeType === "option") {
    estimatedTime += 5;
  }

  const holdingTimeHours = holdingTimeMs / (1000 * 60 * 60);
  if (holdingTimeHours > 24) {
    estimatedTime += 10;
  } else if (holdingTimeHours > 4) {
    estimatedTime += 5;
  }

  return estimatedTime;
};

const TradeExecutionReplay = () => {
  const { user, updateAILimits } = useAuth();
  const { trades: allTrades } = useTrades(user);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const { makeAIRequest, getCachedAnalysis, clearCachedAnalysis } = useAI();
  const [analysis, setAnalysis] = useState(null);
  const [tradeDetails, setTradeDetails] = useState(null);
  const [tradeTimeline, setTradeTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [estimatedResponseTime, setEstimatedResponseTime] = useState(30);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState({
    id: "execution-timing",
    label: "Execution Timing",
    description: "Analysis of your trade timing",
    icon: Clock,
  });

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

  // Clean any math notation that might come from the API
  const processMarkdown = (markdown) => {
    if (!markdown) return "";

    return markdown
      .replace(/\\text\{([^}]+)\}/g, "$1")
      .replace(/\\times/g, "×")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
      .replace(/\\approx/g, "≈")
      .replace(/\[\s*([^[\]]+)\s*\]/g, "$1")
      .replace(/\$\$([^$]+)\$\$/g, "$$$1")
      .replace(/(\d+\.\d+)≈(\d+\.\d+)/g, "$1 ≈ $2");
  };

  // Generate trade replay analysis
  const analyzeTradeExecution = useCallback(async () => {
    if (!selectedTrade) return;

    setLoading(true);
    setAnalysis(null);
    setError(null);
    setTradeTimeline([]);
    setCurrentStep(0);
    setIsPlaying(false);

    try {
      const tradeType = selectedTrade.contractType ? "option" : "stock";

      // First, get the estimated response time (optional)
      try {
        const estimateData = await makeAIRequest(
          "trade-execution-estimate",
          {
            tradeId: selectedTrade._id,
            type: tradeType,
          },
          null,
          { suppressToast: true }
        );

        if (
          estimateData &&
          estimateData.success &&
          estimateData.estimatedSeconds
        ) {
          setEstimatedResponseTime(estimateData.estimatedSeconds);
        }
      } catch (estimateError) {
        console.error("Error fetching estimate:", estimateError);
        // Continue anyway - this is just for user experience
      }

      // Main analysis request
      const data = await makeAIRequest(
        "trade-execution-replay",
        {
          tradeId: selectedTrade._id,
          type: tradeType,
        },
        null,
        { suppressToast: true }
      );

      if (data && data.success) {
        // Enhanced data validation and fallback handling
        // Set analysis with fallback for missing data
        if (data.analysis) {
          setAnalysis(data.analysis);
        } else {
          console.warn("Missing analysis data in API response");
          // Create a minimal analysis structure
          setAnalysis({
            summary:
              "The AI couldn't generate a complete analysis for this trade. Please try again or select a different trade.",
            keyTakeaways: [],
            improvements: [],
          });
        }

        // Set trade details with fallback for missing data
        if (data.tradeDetails) {
          setTradeDetails(data.tradeDetails);
        } else {
          console.warn("Missing trade details in API response");
          // Create minimal trade details from selected trade
          setTradeDetails({
            symbol: selectedTrade.symbol || selectedTrade.ticker,
            entryPrice: selectedTrade.entryPrice,
            exitPrice: selectedTrade.exitPrice,
            profitLoss: selectedTrade.profitLoss?.realized || 0,
            tradeType: selectedTrade.contractType ? "Option" : "Stock",
            decisionTime: "-",
          });
        }

        // Set timeline with fallback for missing data
        if (data.timeline && data.timeline.length > 0) {
          setTradeTimeline(data.timeline);
        } else {
          console.warn("Missing timeline data in API response");
          // Create a minimal timeline with entry/exit events
          const minimalTimeline = [
            {
              title: "Trade Entry",
              actionType: "entry",
              timestamp: selectedTrade.entryDate,
              description: `Entered ${
                selectedTrade.symbol || selectedTrade.ticker
              } at ${selectedTrade.entryPrice}`,
              insight: "Limited data available for detailed timeline.",
            },
          ];

          // Add exit point if trade is closed
          if (selectedTrade.exitDate) {
            minimalTimeline.push({
              title: "Trade Exit",
              actionType: "exit",
              timestamp: selectedTrade.exitDate,
              description: `Exited ${
                selectedTrade.symbol || selectedTrade.ticker
              } at ${selectedTrade.exitPrice || "unknown price"}`,
              insight: "Limited data available for detailed timeline.",
            });
          }

          setTradeTimeline(minimalTimeline);
        }

        // Update estimated time if provided
        if (data.tradeDetails && data.tradeDetails.estimatedSeconds) {
          setEstimatedResponseTime(data.tradeDetails.estimatedSeconds);
        }

        showToast("Trade execution analysis generated successfully", "success");
      } else if (data && data.isCreditsError) {
        // Credit limit error already handled
        // Just don't show additional errors
      } else {
        // Handle other errors
        const errorMessage = data?.error || "Failed to analyze trade execution";
        console.error("API Error:", data);
        setError(errorMessage);
        showToast(
          `Failed to analyze trade execution: ${errorMessage}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error analyzing trade execution:", error);
      if (!error.isCreditsError) {
        setError(error.message || "An unexpected error occurred");
        showToast(
          `Failed to analyze trade execution: ${
            error.message || "Please try again."
          }`,
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedTrade, makeAIRequest, showToast]);

  // 3. Predictive Analysis Component (analyzeTrade function)
  const analyzeTrade = useCallback(async () => {
    if (!selectedTrade || !selectedScenario) return;

    setLoading(true);
    setAnalysisStarted(true);
    setAnalysis(null);
    setError(null);

    try {
      const tradeType = selectedTrade.contractType ? "option" : "stock";

      // Use makeAIRequest instead of direct fetch
      const data = await makeAIRequest(
        "predictive-analysis",
        {
          tradeId: selectedTrade._id,
          type: tradeType,
          scenario: selectedScenario.id,
        },
        null,
        { suppressToast: true }
      );

      if (data && data.success) {
        setAnalysis(data.analysis);
        setTradeDetails(data.tradeDetails);
        showToast("Analysis completed successfully", "success");
      } else if (data && data.isCreditsError) {
        // Credit limit errors are already handled
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
  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
    setTradeDetails(null);
    setTradeTimeline([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setError(null);
    setAnalysisStarted(false);
  }, []);

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

  // Format time for timeline
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  // Auto-play functionality for the timeline
  useEffect(() => {
    let playbackInterval;

    if (isPlaying && tradeTimeline.length > 0) {
      playbackInterval = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep >= tradeTimeline.length - 1) {
            setIsPlaying(false);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, 3000 / playbackSpeed); // Adjust speed based on playbackSpeed
    }

    return () => {
      if (playbackInterval) clearInterval(playbackInterval);
    };
  }, [isPlaying, tradeTimeline, playbackSpeed]);

  // Timeline navigation controls
  const startPlayback = () => setIsPlaying(true);
  const pausePlayback = () => setIsPlaying(false);
  const nextStep = () => {
    if (currentStep < tradeTimeline.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const goToStart = () => setCurrentStep(0);
  const goToEnd = () => setCurrentStep(tradeTimeline.length - 1);

  // Get icon based on action type
  const getActionIcon = (action) => {
    switch (action) {
      case "entry":
        return <ArrowDown className="text-green-500" />;
      case "exit":
        return <ArrowUp className="text-red-500" />;
      case "hover":
        return <MousePointer className="text-yellow-500" />;
      case "hesitation":
        return <Clock className="text-orange-500" />;
      case "opportunity":
        return <Crosshair className="text-blue-500" />;
      case "market":
        return <LineChart className="text-purple-500" />;
      default:
        return <ChevronRight className="text-gray-500" />;
    }
  };
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        AI Trade Execution Replay
      </h2>

      {!analysis && !loading && (
        <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-8 text-center mb-6 border border-gray-200 dark:border-gray-600/50">
          <Film className="h-12 w-12 mx-auto mb-4 text-indigo-400 dark:text-indigo-500" />
          <p className="text-lg text-gray-800 dark:text-gray-100 mb-3">
            Review Your Trade Like a Pro Athlete Watches Game Tape
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            AI reconstructs your trade execution step-by-step and provides
            analysis on your decision timing, hesitations, and potential
            improvements.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Trade Selection */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 
                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="mb-2">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select a trade to analyze:
            </h3>
          </div>

          <div className="overflow-y-auto max-h-[70vh]">
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
      ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800"
      : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
  }`}
                    onClick={() => setSelectedTrade(trade)}
                  >
                    {/* Trade item content */}
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {trade.symbol || trade.ticker}
                      </div>
                      <div
                        className={`px-2 py-0.5 text-xs rounded-sm ${
                          trade.profitLoss?.realized > 0
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : trade.profitLoss?.realized < 0
                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
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

        {/* Right Side - Analysis Display */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-8 border border-gray-200 dark:border-gray-600/50">
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Reconstructing your trade execution...
                </p>
                <AIResponseCountdown
                  isLoading={loading}
                  estimatedTime={estimatedResponseTime}
                />
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-sm shadow-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Analysis Error</h3>
              </div>
              <p>{error}</p>
              <button
                onClick={resetAnalysis}
                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-sm"
              >
                Try Again
              </button>
            </div>
          ) : !selectedTrade ? (
            <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-8 text-center border border-gray-200 dark:border-gray-600/50">
              <div className="text-gray-500 dark:text-gray-300 mb-2">
                <Compass className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-lg">Select a trade from the list</p>
                <p className="text-sm mt-2">
                  Choose a trade to see a step-by-step replay and analysis
                </p>
              </div>
            </div>
          ) : !analysis ? (
            <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-8 text-center border border-gray-200 dark:border-gray-600/50">
              <div className="text-gray-700 dark:text-gray-300">
                <History className="h-16 w-16 mx-auto mb-4 text-indigo-400 dark:text-indigo-500" />
                <p className="text-xl font-medium mb-2">
                  Trade Selected: {selectedTrade.symbol}
                </p>
                <p className="text-base mb-8">
                  Ready to analyze your execution step-by-step.
                </p>

                {/* Large, prominent button */}
                <button
                  className="w-full md:w-3/4 mx-auto py-4 px-6 bg-blue-600 dark:bg-blue-600/90 
  hover:bg-blue-700 dark:hover:bg-blue-700 text-white text-lg font-medium rounded-sm 
  flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  onClick={analyzeTradeExecution}
                  disabled={loading}
                >
                  <Film className="h-6 w-6 mr-3" />
                  <span>Run Execution Analysis</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              {/* More content follows */}
              {/* Trade Timeline Player */}
              {tradeTimeline && tradeTimeline.length > 0 && (
                <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600/50 pb-2 flex items-center">
                    <Film className="w-5 h-5 mr-2 text-indigo-500" />
                    Trade Execution Timeline
                  </h3>

                  {/* Timeline Visualization */}
                  <div className="mb-4 bg-gray-100 dark:bg-gray-600/30 rounded-sm p-4 border border-gray-200 dark:border-gray-600/50">
                    <div className="relative">
                      {/* Timeline Progress Bar */}
                      <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-sm overflow-hidden">
                        <div
                          className="h-2 bg-indigo-500"
                          style={{
                            width: `${
                              (currentStep / (tradeTimeline.length - 1)) * 100
                            }%`,
                          }}
                        ></div>
                      </div>

                      {/* Timeline Markers */}
                      <div className="flex justify-between mt-2">
                        {tradeTimeline.map((event, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full cursor-pointer 
  bg-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-400 ${
    index <= currentStep ? "bg-indigo-500" : "bg-gray-400 dark:bg-gray-500"
  } ${
                              index === currentStep
                                ? "ring-2 ring-indigo-300 dark:ring-indigo-400"
                                : ""
                            }`}
                            onClick={() => setCurrentStep(index)}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Current Event Display */}
                    {tradeTimeline[currentStep] && (
                      <div className="mt-6 p-4 border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50 dark:bg-indigo-900/20 rounded-sm">
                        <div className="flex items-start">
                          <div className="p-2 bg-white dark:bg-gray-700/60 rounded-sm mr-3 border border-gray-200 dark:border-gray-600/50">
                            {getActionIcon(
                              tradeTimeline[currentStep].actionType
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {tradeTimeline[currentStep].title}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(
                                  tradeTimeline[currentStep].timestamp
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {tradeTimeline[currentStep].description}
                            </p>
                            {tradeTimeline[currentStep].insight && (
                              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/70 rounded-sm text-xs text-yellow-800 dark:text-yellow-300">
                                <div className="flex items-start">
                                  <Lightbulb className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                  <span>
                                    {tradeTimeline[currentStep].insight}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Playback Controls */}
                    <div className="flex items-center justify-center mt-4 space-x-4">
                      <button
                        onClick={goToStart}
                        className="p-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <SkipBack className="h-5 w-5" />
                      </button>
                      <button
                        onClick={prevStep}
                        className="p-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <ChevronRight className="h-5 w-5 transform rotate-180" />
                      </button>
                      {isPlaying ? (
                        <button
                          onClick={pausePlayback}
                          className="p-2 bg-indigo-100 dark:bg-indigo-800/70 rounded-sm text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                        >
                          <Pause className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={startPlayback}
                          className="p-2 bg-indigo-100 dark:bg-indigo-800/70 rounded-sm text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                        >
                          <Play className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={nextStep}
                        className="p-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <button
                        onClick={goToEnd}
                        className="p-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <SkipForward className="h-5 w-5" />
                      </button>

                      {/* Playback Speed */}
                      <div className="ml-2">
                        <select
                          value={playbackSpeed}
                          onChange={(e) =>
                            setPlaybackSpeed(Number(e.target.value))
                          }
                          className="text-xs p-1 bg-gray-100 dark:bg-gray-600/50 border border-gray-300 dark:border-gray-600/70 rounded-sm text-gray-700 dark:text-gray-300"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={1}>1x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Analysis Content */}
              <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm border border-gray-200 dark:border-gray-600/50">
                {/* Analysis Header */}
                <div className="border-b border-gray-200 dark:border-gray-600/50 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <ClipboardList className="mr-2 h-5 w-5 text-indigo-500" />
                        Trade Execution Analysis: {tradeDetails?.symbol}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Step-by-step breakdown of your decision timing and
                        execution
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 text-sm rounded-sm font-medium ${
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div className="bg-gray-50 dark:bg-gray-600/30 p-2 rounded-sm border border-gray-200 dark:border-gray-600/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Entry
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(tradeDetails.entryPrice)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-600/30 p-2 rounded-sm border border-gray-200 dark:border-gray-600/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Exit
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {tradeDetails.exitPrice
                            ? formatCurrency(tradeDetails.exitPrice)
                            : "Open"}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-600/30 p-2 rounded-sm border border-gray-200 dark:border-gray-600/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Trade Type
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {tradeDetails.tradeType}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-600/30 p-2 rounded-sm border border-gray-200 dark:border-gray-600/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Decision Time
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {tradeDetails.decisionTime || "-"} sec
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
                          let Icon = BarChart2;
                          const content = props.children?.toString() || "";

                          if (content.includes("Execution"))
                            Icon = MousePointer;
                          if (content.includes("Hesitation")) Icon = Clock;
                          if (content.includes("Opportunity")) Icon = Maximize2;
                          if (content.includes("Timing")) Icon = Clock;
                          if (content.includes("Improvement"))
                            Icon = TrendingUp;
                          if (content.includes("Strengths")) Icon = PieChart;

                          return (
                            <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mt-6 mb-3 flex items-center border-l-2 border-indigo-600 dark:border-indigo-500 pl-3">
                              <Icon className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-300" />
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
                            <span className="text-indigo-500 dark:text-indigo-400 mr-2 mt-1">
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
                      {processMarkdown(analysis)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              {/* Summary & Key Takeaways */}
              <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-6 border border-gray-200 dark:border-gray-600/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center border-l-4 border-indigo-500 dark:border-indigo-400 pl-3">
                  <Lightbulb className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                  Key Takeaways
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  These are the most important insights from your trade
                  execution.
                </p>

                <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                  {analysis?.keyTakeaways?.length > 0 ? (
                    analysis.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 dark:text-indigo-400 mr-2">
                          •
                        </span>
                        <span className="flex-1">{takeaway}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No key takeaways identified.
                    </p>
                  )}
                </ul>
              </div>

              {/* Performance Breakdown */}
              <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-6 border border-gray-200 dark:border-gray-600/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center border-l-4 border-indigo-500 dark:border-indigo-400 pl-3">
                  <PieChart className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                  Performance Breakdown
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  A detailed breakdown of your trade execution performance.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-600/50 rounded-sm bg-gray-50 dark:bg-gray-600/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Win Rate
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {analysis?.winRate
                        ? `${analysis.winRate.toFixed(1)}%`
                        : "-"}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-600/50 rounded-sm bg-gray-50 dark:bg-gray-600/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Avg Profit
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {analysis?.averageProfit
                        ? formatCurrency(analysis.averageProfit)
                        : "-"}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-600/50 rounded-sm bg-gray-50 dark:bg-gray-600/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Holding Time
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {analysis?.holdingTime
                        ? `${analysis.holdingTime} min`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested Improvements */}
              <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-6 border border-gray-200 dark:border-gray-600/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center border-l-4 border-indigo-500 dark:border-indigo-400 pl-3">
                  <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                  Suggested Improvements
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  AI-generated recommendations to improve your execution.
                </p>

                <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                  {analysis?.improvements?.length > 0 ? (
                    analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">
                          ✔
                        </span>
                        <span className="flex-1">{improvement}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No suggested improvements at this time.
                    </p>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeExecutionReplay;
