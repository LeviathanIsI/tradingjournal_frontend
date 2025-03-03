// Create a new file: src/hooks/useTradeAnalysis.js
import { useState, useCallback, useEffect } from "react";
import { useAI } from "../context/AIContext";

export function useTradeAnalysis(options = {}) {
  const {
    defaultScenario = null,
    onAnalysisComplete = () => {},
    initialTrade = null,
  } = options;

  // State
  const [selectedTrade, setSelectedTrade] = useState(initialTrade);
  const [selectedScenario, setSelectedScenario] = useState(defaultScenario);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);

  // Context
  const { generateTradeAnalysis, isGenerating } = useAI();

  // Analyze trade function
  const analyzeTrade = useCallback(
    async (force = false) => {
      if (!selectedTrade || !selectedScenario) {
        setError("Missing required data: trade or scenario not selected");
        return null;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const results = await generateTradeAnalysis({
          tradeId: selectedTrade.id,
          scenarioId: selectedScenario.id,
          force,
        });

        setAnalysisResults(results);
        onAnalysisComplete(results);
        return results;
      } catch (err) {
        setError(err.message || "Analysis failed");
        console.error("Analysis error:", err);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [selectedTrade, selectedScenario, generateTradeAnalysis, onAnalysisComplete]
  );

  return {
    // State
    selectedTrade,
    selectedScenario,
    isAnalyzing,
    isGenerating,
    analysisResults,
    error,

    // Actions
    setSelectedTrade,
    setSelectedScenario,
    analyzeTrade,

    // Utilities
    clearResults: () => setAnalysisResults(null),
    clearError: () => setError(null),
  };
}
