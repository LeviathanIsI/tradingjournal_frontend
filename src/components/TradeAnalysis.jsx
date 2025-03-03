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
import { Clock, Brain, AlertTriangle, TrendingUp } from "lucide-react";

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
  const [psychologyAnalysis, setPsychologyAnalysis] = useState([]);
  const [mistakesAnalysis, setMistakesAnalysis] = useState([]);

  useEffect(() => {
    const fetchAnalysis = async () => {
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
      }
    };

    fetchAnalysis();
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
        emotionData.profit += trade.profitLoss.realized;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      {/* Button Group - Scrollable on mobile */}
      <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0">
        <button
          onClick={() => setActiveSection(SECTIONS.PATTERNS)}
          className={`flex items-center px-3 sm:px-4 py-2 rounded-md whitespace-nowrap flex-shrink-0 text-sm ${
            activeSection === SECTIONS.PATTERNS
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Patterns
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.TIME)}
          className={`flex items-center px-3 sm:px-4 py-2 rounded-md whitespace-nowrap flex-shrink-0 text-sm ${
            activeSection === SECTIONS.TIME
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          <Clock className="mr-2 h-4 w-4" />
          Time Analysis
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.PSYCHOLOGY)}
          className={`flex items-center px-3 sm:px-4 py-2 rounded-md whitespace-nowrap flex-shrink-0 text-sm ${
            activeSection === SECTIONS.PSYCHOLOGY
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          <Brain className="mr-2 h-4 w-4" />
          Psychology
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.MISTAKES)}
          className={`flex items-center px-3 sm:px-4 py-2 rounded-md whitespace-nowrap flex-shrink-0 text-sm ${
            activeSection === SECTIONS.MISTAKES
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Mistakes
        </button>
      </div>
      {/* Pattern Analysis Section */}
      {activeSection === SECTIONS.PATTERNS && (
        <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            Pattern Analysis
          </h3>
          <div className="h-64 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patternAnalysis}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-gray-300 dark:text-gray-700/50"
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--tooltip-border)",
                    padding: "0.75rem",
                  }}
                  itemStyle={{ color: "var(--tooltip-text)" }}
                  labelStyle={{ color: "var(--tooltip-text)" }}
                />
                <Legend className="text-gray-900 dark:text-gray-100" />
                <Bar
                  yAxisId="left"
                  dataKey="winRate"
                  name="Win Rate %"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="averageProfit"
                  name="Avg Profit"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Time Analysis Section */}
      {activeSection === SECTIONS.TIME && (
        <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            Time Analysis
          </h3>
          <div className="h-64 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeAnalysis}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-gray-300 dark:text-gray-700/50"
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--tooltip-border)",
                    padding: "0.75rem",
                  }}
                  itemStyle={{ color: "var(--tooltip-text)" }}
                  labelStyle={{ color: "var(--tooltip-text)" }}
                />
                <Legend className="text-gray-900 dark:text-gray-100" />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  name="Win Rate %"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="totalProfit"
                  name="Total Profit"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Psychology Analysis Section */}
      {activeSection === SECTIONS.PSYCHOLOGY && (
        <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            Psychology Analysis
          </h3>
          <div className="h-64 sm:h-96">
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
                  className="text-gray-300 dark:text-gray-700/50"
                />
                <XAxis
                  dataKey="emotion"
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--tooltip-border)",
                    padding: "0.75rem",
                  }}
                  itemStyle={{ color: "var(--tooltip-text)" }}
                  labelStyle={{ color: "var(--tooltip-text)" }}
                />
                <Legend className="text-gray-900 dark:text-gray-100" />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Occurrences"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="avgProfit"
                  name="Avg Profit"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mistakes Analysis Section */}
      {activeSection === SECTIONS.MISTAKES && (
        <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            Common Mistakes
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-6 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
            {Object.keys(mistakesAnalysis).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(mistakesAnalysis).map(([mistake, count]) => (
                  <li
                    key={mistake}
                    className="flex justify-between items-center p-3 rounded-md border border-gray-300 dark:border-gray-600/50"
                  >
                    <span className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                      {mistake}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      {count} times
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No recorded mistakes.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeAnalysis;
