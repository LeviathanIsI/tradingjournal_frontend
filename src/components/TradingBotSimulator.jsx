import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAI } from "../context/AIContext";
import { useTrades } from "../hooks/useTrades";
import {
  Search,
  Loader,
  Bot,
  DollarSign,
  TrendingUp,
  Target,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Filter,
  BarChart,
  Share2,
  CornerRightDown,
  ChevronRight,
  Award,
  Zap,
  Shuffle,
  Crosshair,
} from "lucide-react";
import AIResponseCountdown from "./AIResponseCountdown";
import { useToast } from "../context/ToastContext";

const TradingBotSimulator = () => {
  const { user } = useAuth();
  const {
    makeAIRequest,
    getCachedAnalysis,
    clearCachedAnalysis,
    clearCacheWithPrefix,
  } = useAI();
  const { trades: allTrades } = useTrades(user);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [timeframe, setTimeframe] = useState("Intraday");
  const { showToast } = useToast();
  const [strategy, setStrategy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estimatedResponseTime, setEstimatedResponseTime] = useState(30);

  // Initialize state from localStorage with error handling
  const [simulationData, setSimulationData] = useState(() => {
    try {
      const saved = localStorage.getItem("tradingSimulationData");
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      return parsed.simulationData || null;
    } catch (e) {
      console.error("Error loading simulation data:", e);
      localStorage.removeItem("tradingSimulationData");
      return null;
    }
  });

  const [tradeHistory, setTradeHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("tradingSimulationData");
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      return parsed.tradeHistory || null;
    } catch (e) {
      console.error("Error loading trade history:", e);
      return null;
    }
  });

  // Add this effect to save data when it changes
  useEffect(() => {
    if (simulationData && tradeHistory) {
      try {
        const dataToSave = {
          simulationData,
          tradeHistory,
        };
        localStorage.setItem(
          "tradingSimulationData",
          JSON.stringify(dataToSave)
        );
      } catch (e) {
        console.error("Error saving simulation data:", e);
      }
    }
  }, [simulationData, tradeHistory]);

  // Get unique symbols from past trades
  const uniqueSymbols = useMemo(() => {
    if (!allTrades || allTrades.length === 0) return [];

    const symbols = allTrades
      .map((trade) => trade.symbol || trade.ticker)
      .filter(Boolean);
    return [...new Set(symbols)].sort();
  }, [allTrades]);

  // Filter symbols based on search query
  const filteredSymbols = useMemo(() => {
    if (!searchQuery) return uniqueSymbols;
    return uniqueSymbols.filter((symbol) =>
      symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueSymbols, searchQuery]);

  // Fetch and analyze past trades for trading bot simulation
  const generateTradingSimulation = useCallback(async () => {
    if (!selectedSymbol) {
      setError("Please select a symbol first");
      return;
    }

    setLoading(true);
    setError(null);
    setSimulationData(null);
    setTradeHistory(null);

    try {
      // Use makeAIRequest instead of direct fetch
      const data = await makeAIRequest(
        "trading-bot-simulator",
        {
          symbol: selectedSymbol,
          timeframe,
          strategy,
        },
        null,
        { suppressToast: true }
      );

      if (data && data.success) {
        // Ensure we have the expected data structure
        if (!data.simulation) {
          throw new Error("Missing simulation data in API response");
        }

        setSimulationData(data.simulation);
        setTradeHistory(data.tradeHistory);

        // Save to localStorage
        try {
          localStorage.setItem(
            "tradingSimulationData",
            JSON.stringify({
              simulationData: data.simulation,
              tradeHistory: data.tradeHistory,
            })
          );
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }

        // Set estimated time if provided
        if (data.estimatedSeconds) {
          setEstimatedResponseTime(data.estimatedSeconds);
        }

        showToast("Trading simulation generated successfully", "success");
      } else if (data && data.isCreditsError) {
        // Credit limit errors are already handled by makeAIRequest
      } else {
        // Only handle non-credit errors
        setError(data?.error || "Failed to generate trading simulation");
        showToast(
          "Failed to generate trading simulation. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error generating trading simulation:", error);
      // Only show error if it's not a credits error
      if (!error.isCreditsError) {
        setError(error.message);
        showToast(
          "Failed to generate trading simulation. Please try again.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, timeframe, strategy, makeAIRequest, showToast]);

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const resetSimulation = useCallback(() => {
    setSimulationData(null);
    setTradeHistory(null);
    setError(null);
    setLoading(false);

    // Clear all related caches
    if (clearCacheWithPrefix) {
      clearCacheWithPrefix("trading-bot-simulator");
    }

    // Clear localStorage
    localStorage.removeItem("tradingSimulationData");

    showToast("Simulation reset successfully", "success");
  }, [clearCacheWithPrefix, showToast]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        AI Trading Bot Simulator
      </h2>

      {/* Top section - Inputs and Controls */}
      <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-600/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Symbol Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Symbol
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 
                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="mt-2 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-600/30 rounded-sm border border-gray-200 dark:border-gray-600/50">
              {filteredSymbols.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No symbols found
                </div>
              ) : (
                <div className="p-1">
                  {filteredSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      className={`w-full text-left px-3 py-2 text-sm rounded-sm mb-1 ${
                        selectedSymbol === symbol
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-600/30 text-gray-700 dark:text-gray-300"
                      }`}
                      onClick={() => setSelectedSymbol(symbol)}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timeframe Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trading Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
              bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 
              focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Intraday">Intraday</option>
              <option value="Swing">Swing (Multi-day)</option>
              <option value="Position">Position (Weeks/Months)</option>
              <option value="Scalping">Scalping (Minutes)</option>
            </select>

            {/* Strategy Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Strategy (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Breakout, Reversal, Gap-and-Go"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 
                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col justify-end">
            <button
              className="w-full py-3 px-4 bg-blue-600 dark:bg-blue-600/90 text-white rounded-sm 
  hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
  transition-colors flex items-center justify-center gap-2 mt-auto cursor-pointer"
              onClick={generateTradingSimulation}
              disabled={!selectedSymbol || loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Bot className="h-5 w-5" />
                  <span>Generate Trading Simulation</span>
                </>
              )}
            </button>

            {/* Selected Symbol Display */}
            {selectedSymbol && (
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                  <Target className="h-4 w-4 mr-1" />
                  {selectedSymbol}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-8 text-center border border-gray-200 dark:border-gray-600/50">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader className="animate-spin h-12 w-12 text-blue-500" />
              <Bot className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              AI is analyzing your past trades and generating optimal
              strategies...
            </p>
            <AIResponseCountdown
              isLoading={loading}
              estimatedTime={estimatedResponseTime}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-sm shadow-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Simulation Error</h3>
          </div>
          <p>{error}</p>
        </div>
      )}

      {/* Results Display */}
      {!loading && simulationData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Trade History and Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trade History Card */}
            <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-blue-500" />
                Trade History: {selectedSymbol}
              </h3>

              {tradeHistory && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-sm p-3 border border-blue-100 dark:border-blue-800/50">
                      <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                        Total Trades
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {tradeHistory.totalTrades}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-sm p-3 border border-green-100 dark:border-green-800/50">
                      <div className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">
                        Win Rate
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {tradeHistory.winRate}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-sm p-3 border border-green-100 dark:border-green-800/50">
                      <div className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">
                        Avg. Win
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(tradeHistory.avgWin)}
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-sm p-3 border border-red-100 dark:border-red-800/50">
                      <div className="text-xs text-red-700 dark:text-red-300 font-medium mb-1">
                        Avg. Loss
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(tradeHistory.avgLoss)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Position Sizing Recommendation */}
            {simulationData?.positionSizing && (
              <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                  Position Sizing
                </h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-sm border border-green-100 dark:border-green-800/50">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    {simulationData.positionSizing.recommendation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {simulationData.positionSizing.rationale}
                  </p>
                </div>
              </div>
            )}

            {/* Stop Loss Strategy */}
            {simulationData?.stopLossStrategy && (
              <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Stop Loss Strategy
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-sm border border-red-100 dark:border-red-800/50">
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    {simulationData.stopLossStrategy.recommendation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {simulationData.stopLossStrategy.rationale}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Strategy and Entry Points */}
          <div className="lg:col-span-2 space-y-6">
            {/* Optimal Entry Strategy */}
            <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Optimal Entry Strategy
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-sm border border-blue-100 dark:border-blue-800/50">
                <p className="text-gray-800 dark:text-gray-200">
                  {simulationData?.optimalEntryStrategy}
                </p>
              </div>
            </div>

            {/* Entry Points */}
            {simulationData?.entryPoints &&
              simulationData.entryPoints.length > 0 && (
                <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Crosshair className="h-5 w-5 mr-2 text-blue-500" />
                    Recommended Entry Points
                  </h3>
                  <div className="space-y-3">
                    {simulationData.entryPoints.map((entry, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-600/30 p-3 rounded-sm border border-gray-200 dark:border-gray-600/50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Entry Point {index + 1}
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(entry.price)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {entry.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Exit Strategy Optimization */}
            {simulationData?.exitStrategyOptimization && (
              <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2 text-purple-500" />
                  Exit Strategy Optimization
                </h3>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-sm border border-purple-100 dark:border-purple-800/50">
                  <p className="text-purple-800 dark:text-purple-200 font-medium">
                    {simulationData.exitStrategyOptimization.recommendation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {simulationData.exitStrategyOptimization.rationale}
                  </p>
                </div>
              </div>
            )}

            {/* What-If Scenarios */}
            {simulationData?.scenarios &&
              simulationData.scenarios.length > 0 && (
                <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-4 border border-gray-200 dark:border-gray-600/50">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Shuffle className="h-5 w-5 mr-2 text-indigo-500" />
                    What-If Scenarios
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {simulationData.scenarios.map((scenario, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-sm border ${
                          index === 0
                            ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50"
                            : index === 1
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/50"
                            : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50"
                        }`}
                      >
                        <div className="font-medium mb-1 flex items-center">
                          <span
                            className={`mr-2 text-xs px-2 py-0.5 rounded-sm ${
                              index === 0
                                ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                                : index === 1
                                ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                                : "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                            }`}
                          >
                            {scenario.description}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 text-xs">
                            {scenario.riskRewardRatio}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {scenario.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Empty State - No simulation yet */}
      {!loading && !error && !simulationData && (
        <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-8 text-center border border-gray-200 dark:border-gray-600/50">
          <Bot className="h-16 w-16 mx-auto text-blue-400 dark:text-blue-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
            AI Trading Bot Simulator
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Select a symbol you've traded before and the AI will analyze your
            past trades to create a customized trading strategy simulation.
          </p>
          <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
            <div className="flex items-center w-full">
              <Award className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-sm text-left text-gray-600 dark:text-gray-300">
                Discover your optimal entries based on past successes
              </p>
            </div>
            <div className="flex items-center w-full">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
              <p className="text-sm text-left text-gray-600 dark:text-gray-300">
                Get recommendations for stop losses and position sizing
              </p>
            </div>
            <div className="flex items-center w-full">
              <Share2 className="h-5 w-5 text-blue-500 mr-3" />
              <p className="text-sm text-left text-gray-600 dark:text-gray-300">
                See what-if scenarios with different risk-reward ratios
              </p>
            </div>
          </div>
        </div>
      )}

      {simulationData && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 rounded-sm border border-gray-300 dark:border-gray-600/70"
          >
            Reset Simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default TradingBotSimulator;
