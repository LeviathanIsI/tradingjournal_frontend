// src/components/PositionCalculatorModal.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const PositionCalculatorModal = ({
  entryPrice,
  stopLoss,
  targetPrice,
  onCalculate,
  isOpen,
  onClose,
}) => {
  console.log("Modal mounted, isOpen:", isOpen);

  if (!isOpen) {
    console.log("Modal not showing because isOpen is false");
    return null;
  }

  console.log("Modal should be visible");
  const { user } = useAuth();
  const [accountSize, setAccountSize] = useState(
    user?.preferences?.startingCapital || 0
  );
  const [riskPercentage, setRiskPercentage] = useState(1); // Default 1% risk
  const [calculations, setCalculations] = useState(null);

  const calculatePosition = () => {
    if (!entryPrice || !stopLoss) return;

    const riskAmount = accountSize * (riskPercentage / 100);
    const lossPerShare = Math.abs(entryPrice - stopLoss);
    const suggestedShares = Math.floor(riskAmount / lossPerShare);
    const totalRisk = lossPerShare * suggestedShares;
    const potentialProfit = targetPrice
      ? Math.abs(targetPrice - entryPrice) * suggestedShares
      : 0;
    const riskRewardRatio = targetPrice ? potentialProfit / totalRisk : 0;

    const result = {
      riskAmount,
      suggestedShares,
      totalRisk,
      maxPosition: suggestedShares * entryPrice,
      potentialProfit,
      riskRewardRatio,
    };

    setCalculations(result);
    if (onCalculate) onCalculate(result);
  };

  useEffect(() => {
    calculatePosition();
  }, [entryPrice, stopLoss, targetPrice, accountSize, riskPercentage]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Size
          </label>
          <input
            type="number"
            value={accountSize}
            onChange={(e) => setAccountSize(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Risk Percentage
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              min="0.1"
              max="100"
              step="0.1"
            />
            <span className="ml-2">%</span>
          </div>
        </div>
      </div>

      {calculations && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-gray-900 mb-3">Position Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Suggested Shares</p>
              <p className="text-lg font-medium text-gray-900">
                {calculations.suggestedShares.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Position Size</p>
              <p className="text-lg font-medium text-gray-900">
                ${calculations.maxPosition.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dollar Risk</p>
              <p className="text-lg font-medium text-gray-900">
                ${calculations.totalRisk.toFixed(2)}
              </p>
            </div>
            {calculations.potentialProfit > 0 && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Potential Profit</p>
                  <p className="text-lg font-medium text-green-600">
                    ${calculations.potentialProfit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk/Reward</p>
                  <p className="text-lg font-medium text-gray-900">
                    1:{calculations.riskRewardRatio.toFixed(2)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionCalculatorModal;
