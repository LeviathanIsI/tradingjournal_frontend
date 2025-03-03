import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Loader,
  BarChart2,
  TrendingUp,
  Clock,
  Calendar,
  Target,
  Lightbulb,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AIResponseCountdown from "./AIResponseCountdown";

const PatternRecognition = () => {
  const { user, updateAILimits } = useAuth();
  // CHANGE: Set loading to false initially
  const [loading, setLoading] = useState(false);
  // ADD: New state to track if analysis has been requested
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [patternAnalysis, setPatternAnalysis] = useState(null);
  const [patternData, setPatternData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("symbols");
  const [estimatedResponseTime, setEstimatedResponseTime] = useState(30);

  const fetchPatternAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      // ADD: Set analysisStarted to true when fetch begins
      setAnalysisStarted(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/pattern-analysis`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${await response.text()}`);
      }

      const data = await response.json();
      if (data.success) {
        setPatternAnalysis(data.analysis);
        setPatternData(data.data);

        if (data.aiLimits) {
          updateAILimits(data.aiLimits);
        }
      } else {
        setError(data.error || "Failed to analyze trading patterns");
      }
    } catch (error) {
      console.error("Error fetching pattern analysis:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ADD: Function to reset analysis
  const resetAnalysis = () => {
    setPatternAnalysis(null);
    setPatternData(null);
    setError(null);
    setAnalysisStarted(false);
  };

  // Function to format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    const numValue = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numValue);
  };

  // Tabs for data categories
  const tabs = [
    { id: "symbols", label: "Symbols", icon: BarChart2 },
    { id: "setups", label: "Setups", icon: Target },
    { id: "timeOfDay", label: "Time of Day", icon: Clock },
    { id: "dayOfWeek", label: "Day of Week", icon: Calendar },
    { id: "holdingTime", label: "Holding Time", icon: TrendingUp },
  ];

  // CHANGE: Completely replace the return statement with this version
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        AI Pattern Recognition
      </h2>

      {/* Show button when analysis hasn't been started */}
      {!analysisStarted && (
        <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-8 text-center mb-6">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-blue-400 dark:text-blue-500" />
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-3">
            Discover patterns in your trading performance
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            The AI will analyze your entire trading history to identify your
            strengths and opportunities for improvement
          </p>
          <button
            onClick={fetchPatternAnalysis}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-600/90 text-white rounded-sm 
  hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Analyze Trading Patterns
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="animate-spin h-10 w-10 text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your trading patterns...
          </p>
          <AIResponseCountdown
            isLoading={loading}
            estimatedTime={estimatedResponseTime}
          />
        </div>
      ) : analysisStarted && error ? (
        // Only show error if analysis was started
        <div className="bg-red-50 dark:bg-red-700/30 p-4 rounded-sm border border-red-100 dark:border-red-600/50 text-red-600 dark:text-red-300">
          {error}
          <button
            onClick={resetAnalysis}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-700/40 text-red-700 dark:text-red-300 rounded-sm"
          >
            Try Again
          </button>
        </div>
      ) : analysisStarted && patternAnalysis ? (
        // Only show results if analysis was started and completed
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Pattern stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-4">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600/50 pb-3 mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Performance Metrics
                </h3>
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </div>

              {/* Tabs navigation */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-3 py-1.5 rounded-sm text-sm font-medium flex items-center ${
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-700/30 text-blue-600 dark:text-blue-400"
                        : "bg-gray-50 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-4 w-4 mr-1.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="overflow-y-auto max-h-96">
                {activeTab === "symbols" && patternData?.symbolStats && (
                  <div className="space-y-3">
                    {patternData.symbolStats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-sm bg-gray-50 dark:bg-gray-600/40 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{stat.symbol}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stat.count} trades
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={
                              parseFloat(stat.winRate) >= 50
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-red-600 dark:text-red-400 font-semibold"
                            }
                          >
                            {stat.winRate}% Win
                          </div>
                          <div
                            className={
                              parseFloat(stat.profit) >= 0
                                ? "text-green-600 dark:text-green-400 text-xs"
                                : "text-red-600 dark:text-red-400 text-xs"
                            }
                          >
                            {formatCurrency(stat.profit)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "setups" && patternData?.setupStats && (
                  <div className="space-y-3">
                    {patternData.setupStats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-sm bg-gray-50 dark:bg-gray-600/40 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{stat.setup}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stat.count} trades
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={
                              parseFloat(stat.winRate) >= 50
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-red-600 dark:text-red-400 font-semibold"
                            }
                          >
                            {stat.winRate}% Win
                          </div>
                          <div
                            className={
                              parseFloat(stat.profit) >= 0
                                ? "text-green-600 dark:text-green-400 text-xs"
                                : "text-red-600 dark:text-red-400 text-xs"
                            }
                          >
                            {formatCurrency(stat.profit)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "timeOfDay" && patternData?.timeOfDayStats && (
                  <div className="space-y-3">
                    {patternData.timeOfDayStats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-sm bg-gray-50 dark:bg-gray-600/40 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {stat.timeOfDay}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stat.count} trades
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={
                              parseFloat(stat.winRate) >= 50
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-red-600 dark:text-red-400 font-semibold"
                            }
                          >
                            {stat.winRate}% Win
                          </div>
                          <div
                            className={
                              parseFloat(stat.profit) >= 0
                                ? "text-green-600 dark:text-green-400 text-xs"
                                : "text-red-600 dark:text-red-400 text-xs"
                            }
                          >
                            {formatCurrency(stat.profit)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "dayOfWeek" && patternData?.dayOfWeekStats && (
                  <div className="space-y-3">
                    {patternData.dayOfWeekStats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-sm bg-gray-50 dark:bg-gray-600/40 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{stat.day}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stat.count} trades
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={
                              parseFloat(stat.winRate) >= 50
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-red-600 dark:text-red-400 font-semibold"
                            }
                          >
                            {stat.winRate}% Win
                          </div>
                          <div
                            className={
                              parseFloat(stat.profit) >= 0
                                ? "text-green-600 dark:text-green-400 text-xs"
                                : "text-red-600 dark:text-red-400 text-xs"
                            }
                          >
                            {formatCurrency(stat.profit)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "holdingTime" &&
                  patternData?.holdingTimeStats && (
                    <div className="space-y-3">
                      {patternData.holdingTimeStats.map((stat, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-sm bg-gray-50 dark:bg-gray-600/40 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{stat.duration}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {stat.count} trades
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={
                                parseFloat(stat.winRate) >= 50
                                  ? "text-green-600 dark:text-green-400 font-semibold"
                                  : "text-red-600 dark:text-red-400 font-semibold"
                              }
                            >
                              {stat.winRate}% Win
                            </div>
                            <div
                              className={
                                parseFloat(stat.profit) >= 0
                                  ? "text-green-600 dark:text-green-400 text-xs"
                                  : "text-red-600 dark:text-red-400 text-xs"
                              }
                            >
                              {formatCurrency(stat.profit)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Right side - AI analysis */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm p-6">
              <div className="border-b border-gray-200 dark:border-gray-600/50 pb-4 mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-blue-500" />
                  Trading Pattern Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered insights based on your complete trading history
                </p>
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ node, ...props }) => {
                      // Choose icon based on section title
                      let Icon = Target;
                      const content = props.children?.toString() || "";

                      if (
                        content.includes("Key Performance") ||
                        content.includes("Patterns")
                      )
                        Icon = BarChart2;
                      if (content.includes("Strengths")) Icon = ArrowUp;
                      if (content.includes("Areas for Improvement"))
                        Icon = ArrowDown;
                      if (content.includes("Recommendations")) Icon = Lightbulb;

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
                  {patternAnalysis}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PatternRecognition;
