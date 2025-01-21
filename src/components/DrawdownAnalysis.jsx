// src/components/DrawdownAnalysis.jsx
import { useState, useEffect } from "react";

const DrawdownAnalysis = ({ trades }) => {
  const [drawdownStats, setDrawdownStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDrawdownStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/trades/analysis/drawdown",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setDrawdownStats(data.data);
    } catch (error) {
      console.error("Error fetching drawdown stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawdownStats();
  }, [trades]);

  useEffect(() => {
    const fetchDrawdownStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/trades/analysis/drawdown",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setDrawdownStats(data.data);
      } catch (error) {
        console.error("Error fetching drawdown stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrawdownStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Risk Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Maximum Drawdown Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500">
              Maximum Drawdown
            </h3>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              ${Math.abs(drawdownStats.maxDrawdown).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {(
                (drawdownStats.maxDrawdown / drawdownStats.peakEquity) *
                100
              ).toFixed(1)}
              % from peak
            </p>
          </div>

          {/* Consecutive Losses Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500">
              Max Consecutive Losses
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {drawdownStats.maxConsecutiveLosses}
            </p>
            <p className="text-sm text-gray-500 mt-1">trades in a row</p>
          </div>

          {/* Biggest Loss Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500">
              Biggest Single Loss
            </h3>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              ${Math.abs(drawdownStats.biggestLoss).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Current Status
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Peak Equity</p>
                <p className="text-lg font-medium text-gray-900">
                  ${drawdownStats.peakEquity.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Equity</p>
                <p className="text-lg font-medium text-gray-900">
                  ${drawdownStats.currentEquity.toFixed(2)}
                </p>
              </div>
              {drawdownStats.currentDrawdown > 0 && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Current Drawdown</p>
                  <p className="text-lg font-medium text-red-600">
                    ${drawdownStats.currentDrawdown.toFixed(2)}(
                    {(
                      (drawdownStats.currentDrawdown /
                        drawdownStats.peakEquity) *
                      100
                    ).toFixed(1)}
                    %)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawdownAnalysis;
