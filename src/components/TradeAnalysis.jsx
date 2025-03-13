import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Clock,
  Brain,
  AlertTriangle,
  TrendingUp,
  BarChart2,
} from "lucide-react";

const SECTIONS = {
  PATTERNS: "patterns",
  TIME: "time",
  PSYCHOLOGY: "psychology",
  MISTAKES: "mistakes",
};

const TradeAnalysis = ({ trades }) => {
  const [activeSection, setActiveSection] = useState(SECTIONS.PATTERNS);
  const [patternAnalysis, setPatternAnalysis] = useState([]);
  const [timeAnalysis, setTimeAnalysis] = useState([]);
  const [psychologyAnalysis, setPsychologyAnalysis] = useState({
    emotions: {},
    focusLevels: {},
  });
  const [mistakesAnalysis, setMistakesAnalysis] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [patternsRes, timeRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_URL}/api/trades/analysis/patterns`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(`${import.meta.env.VITE_API_URL}/api/trades/analysis/time`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const patterns = await patternsRes.json();
        const time = await timeRes.json();

        setPatternAnalysis(patterns.data);
        setTimeAnalysis(time.data);

        // Process psychology and mistakes data from trades
        processPsychologyData(trades);
        processMistakesData(trades);
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (trades?.length > 0) {
      fetchAnalysis();
    } else {
      setIsLoading(false);
    }
  }, [trades]);

  const processPsychologyData = (trades) => {
    const psychData = trades.reduce(
      (acc, trade) => {
        if (!trade.mentalState) return acc;

        const emotionData = acc.emotions[trade.mentalState.emotion] || {
          count: 0,
          profit: 0,
          avgProfit: 0,
        };

        emotionData.count++;
        emotionData.profit += trade.profitLoss?.realized || 0;
        emotionData.avgProfit = emotionData.profit / emotionData.count;

        acc.emotions[trade.mentalState.emotion] = emotionData;

        // Process focus levels
        if (trade.mentalState.focus) {
          acc.focusLevels[trade.mentalState.focus] =
            (acc.focusLevels[trade.mentalState.focus] || 0) + 1;
        }

        return acc;
      },
      { emotions: {}, focusLevels: {} }
    );

    setPsychologyAnalysis(psychData);
  };

  const processMistakesData = (trades) => {
    const mistakeData = trades.reduce((acc, trade) => {
      if (!trade.mistakes || !trade.mistakes.length) return acc;

      trade.mistakes.forEach((mistake) => {
        acc[mistake] = (acc[mistake] || 0) + 1;
      });

      return acc;
    }, {});

    setMistakesAnalysis(mistakeData);
  };

  // Tooltip styling
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "var(--color-bg-tooltip, rgba(255, 255, 255, 0.95))",
      borderRadius: "0.5rem",
      border: "1px solid var(--color-border-tooltip, rgba(0, 0, 0, 0.1))",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      padding: "0.75rem",
    },
    itemStyle: { color: "var(--color-text-tooltip, #4b5563)" },
    labelStyle: {
      color: "var(--color-text-tooltip-label, #1f2937)",
      fontWeight: "600",
      marginBottom: "0.5rem",
    },
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
      <BarChart2 className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No data available
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Add more trades to generate analysis and insights for this section.
      </p>
    </div>
  );

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm p-4 sm:p-6">
      <div className="border-b border-gray-200 dark:border-gray-700/40 pb-4 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          Trade Analytics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Discover patterns and insights from your trading activity
        </p>
      </div>

      {/* Button Group - Scrollable on mobile */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0 mb-4 sm:mb-6 no-scrollbar">
        <button
          onClick={() => setActiveSection(SECTIONS.PATTERNS)}
          className={`flex items-center px-3 sm:px-4 py-2 rounded-md whitespace-nowrap flex-shrink-0 text-sm transition-colors ${
            activeSection === SECTIONS.PATTERNS
              ? "bg-primary text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Patterns
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.TIME)}
          className={`flex items-center px-3 sm:px-4 py-2 rounded-md whitespace-nowrap flex-shrink-0 text-sm transition-colors ${
            activeSection === SECTIONS.TIME
              ? "bg-primary text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Clock className="mr-2 h-4 w-4" />
          Time Analysis
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.PSYCHOLOGY)}
          className={`flex items-center px-3 sm:px-4 py-2 rounded-md whitespace-nowrap flex-shrink-0 text-sm transition-colors ${
            activeSection === SECTIONS.PSYCHOLOGY
              ? "bg-primary text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Brain className="mr-2 h-4 w-4" />
          Psychology
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.MISTAKES)}
          className={`flex items-center px-3 sm:px-4 py-2 rounded-md whitespace-nowrap flex-shrink-0 text-sm transition-colors ${
            activeSection === SECTIONS.MISTAKES
              ? "bg-primary text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Mistakes
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 sm:h-80">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-md bg-gray-200 dark:bg-gray-700 h-8 w-48 mb-4"></div>
            <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Pattern Analysis Section */}
          {activeSection === SECTIONS.PATTERNS && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                  Pattern Analysis
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 px-2 py-1 rounded">
                  {patternAnalysis.length} patterns
                </span>
              </div>

              {patternAnalysis.length > 0 ? (
                <div className="h-64 sm:h-80 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patternAnalysis}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700/30"
                      />
                      <XAxis
                        dataKey="pattern"
                        tick={{ fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#8884d8"
                        tick={{ fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#82ca9d"
                        tick={{ fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <Tooltip {...tooltipStyle} />
                      <Legend className="text-gray-900 dark:text-gray-100" />
                      <Bar
                        yAxisId="left"
                        dataKey="winRate"
                        name="Win Rate %"
                        fill="var(--color-primary, #3b82f6)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="averageProfit"
                        name="Avg Profit"
                        fill="var(--color-secondary, #14b8a6)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                renderEmptyState()
              )}
            </div>
          )}

          {/* Time Analysis Section */}
          {activeSection === SECTIONS.TIME && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                  Time Analysis
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 px-2 py-1 rounded">
                  24-hour cycle
                </span>
              </div>

              {timeAnalysis.length > 0 ? (
                <div className="h-64 sm:h-80 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeAnalysis}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700/30"
                      />
                      <XAxis
                        dataKey="_id.hour"
                        tick={{ fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <YAxis
                        tick={{ fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <Tooltip {...tooltipStyle} />
                      <Legend className="text-gray-900 dark:text-gray-100" />
                      <Line
                        type="monotone"
                        dataKey="winRate"
                        name="Win Rate %"
                        stroke="var(--color-primary, #3b82f6)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-primary, #3b82f6)", r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalProfit"
                        name="Total Profit"
                        stroke="var(--color-secondary, #14b8a6)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-secondary, #14b8a6)", r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                renderEmptyState()
              )}
            </div>
          )}

          {/* Psychology Analysis Section */}
          {activeSection === SECTIONS.PSYCHOLOGY && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                  Psychology Analysis
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 px-2 py-1 rounded">
                  Emotions vs. Performance
                </span>
              </div>

              {Object.keys(psychologyAnalysis.emotions).length > 0 ? (
                <div className="h-64 sm:h-80 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(psychologyAnalysis.emotions).map(
                        ([emotion, data]) => ({
                          emotion,
                          count: data.count,
                          avgProfit: data.avgProfit,
                        })
                      )}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700/30"
                      />
                      <XAxis
                        dataKey="emotion"
                        tick={{ fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="var(--color-primary, #3b82f6)"
                        tick={{ fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--color-secondary, #14b8a6)"
                        tick={{ fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <Tooltip {...tooltipStyle} />
                      <Legend className="text-gray-900 dark:text-gray-100" />
                      <Bar
                        yAxisId="left"
                        dataKey="count"
                        name="Occurrences"
                        fill="var(--color-primary, #3b82f6)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="avgProfit"
                        name="Avg Profit"
                        fill="var(--color-secondary, #14b8a6)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                renderEmptyState()
              )}
            </div>
          )}

          {/* Mistakes Analysis Section */}
          {activeSection === SECTIONS.MISTAKES && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                  Common Mistakes
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 px-2 py-1 rounded">
                  {Object.keys(mistakesAnalysis).length} types
                </span>
              </div>

              {Object.keys(mistakesAnalysis).length > 0 ? (
                <div className="bg-gray-50/80 dark:bg-gray-700/40 rounded-lg border border-gray-200/80 dark:border-gray-600/30 p-4 sm:p-5 mt-2">
                  <ul className="space-y-2">
                    {Object.entries(mistakesAnalysis)
                      .sort(([, a], [, b]) => b - a)
                      .map(([mistake, count]) => (
                        <li
                          key={mistake}
                          className="flex justify-between items-center p-3 rounded-md bg-white/90 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/40 shadow-sm"
                        >
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {mistake}
                          </span>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {count} {count === 1 ? "time" : "times"}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                renderEmptyState()
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TradeAnalysis;
