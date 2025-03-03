import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTrades } from "../hooks/useTrades";
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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AIResponseCountdown from "./AIResponseCountdown";

const WeeklyReview = () => {
  const { user, updateAILimits } = useAuth();
  const { trades, fetchTradesForWeek, analyzeTradesForWeek } = useTrades(user);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [estimatedResponseTime, setEstimatedResponseTime] = useState(20);

  useEffect(() => {
    if (selectedWeek) {
      setLoading(true);
      fetchTradesForWeek(selectedWeek).then((data) => {
        setReviewData(data);
        setLoading(false);
      });
    }
  }, [selectedWeek]);

  const handleStartReport = async () => {
    if (!selectedWeek) return;

    setLoading(true);
    setAiAnalysis(null);

    try {
      const weekData = await fetchTradesForWeek(selectedWeek);
      setReviewData(weekData);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/analyze-week`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ week: selectedWeek }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${await response.text()}`);
      }

      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.analysis);

        if (data.aiLimits) {
          updateAILimits(data.aiLimits);
        }
      }
    } catch (error) {
      console.error("Error generating AI report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 rounded-sm shadow-sm border border-gray-200 dark:border-gray-600/50">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-blue-400 mb-4 border-b border-gray-200 dark:border-gray-600/50 pb-2 flex items-center">
        <BarChart className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />{" "}
        AI Trading Analysis
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
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:border-blue-400"
        />
        <button
          className="px-4 py-2 bg-blue-600 dark:bg-blue-600/90 text-white rounded-sm 
  hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors cursor-pointer"
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
        <div className="bg-white dark:bg-gray-700/60 rounded-sm shadow-sm p-8 border border-gray-200 dark:border-gray-600/50">
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
        <div className="mt-6 p-6 border border-gray-200 dark:border-gray-600/50 bg-gray-50 dark:bg-gray-600/30 rounded-sm">
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
                          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-8 mb-4 pb-3 border-b border-gray-200 dark:border-gray-600/50 flex items-center">
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
                return (
                  <div className="text-red-600 dark:text-red-400">
                    <p>Error rendering markdown. See console for details.</p>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-600/30 rounded-sm text-xs overflow-auto border border-gray-200 dark:border-gray-600/50">
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
