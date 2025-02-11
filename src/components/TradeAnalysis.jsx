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

  const renderPatternAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Pattern Analysis</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={patternAnalysis}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pattern" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
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
  );

  const renderTimeAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Time Analysis</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeAnalysis}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id.hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="winRate"
              name="Win Rate %"
              stroke="#8884d8"
            />
            <Line
              type="monotone"
              dataKey="totalProfit"
              name="Total Profit"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveSection(SECTIONS.PATTERNS)}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeSection === SECTIONS.PATTERNS
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Patterns
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.TIME)}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeSection === SECTIONS.TIME
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <Clock className="mr-2 h-4 w-4" />
          Time Analysis
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.PSYCHOLOGY)}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeSection === SECTIONS.PSYCHOLOGY
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <Brain className="mr-2 h-4 w-4" />
          Psychology
        </button>
        <button
          onClick={() => setActiveSection(SECTIONS.MISTAKES)}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeSection === SECTIONS.MISTAKES
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Mistakes
        </button>
      </div>

      {activeSection === SECTIONS.PATTERNS && renderPatternAnalysis()}
      {activeSection === SECTIONS.TIME && renderTimeAnalysis()}
      {/* Add other sections as we implement them */}
    </div>
  );
};

export default TradeAnalysis;
