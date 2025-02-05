// src/components/PositionCalculatorModal.jsx
import { useRef, useEffect, useState } from "react";
import { X, Calculator } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PositionCalculatorModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [entryPrice, setEntryPrice] = useState("");
  const [riskRatio, setRiskRatio] = useState("");
  const [rewardRatio, setRewardRatio] = useState("");
  const [shares, setShares] = useState("");
  const [calculations, setCalculations] = useState(null);

  const calculatePosition = () => {
    if (!entryPrice) return;

    const entry = Number(entryPrice);
    const riskNumber = Number(riskRatio) || 1;
    const rewardNumber = Number(rewardRatio) || 1;
    const sharesCount = Number(shares) || 0;
    const positionSize = sharesCount * entry;

    // Base volatility factor based on stock price
    const priceVolatility =
      entry < 1
        ? 0.05 // Under $1 = 5%
        : entry < 5
        ? 0.03 // Under $5 = 3%
        : entry < 10
        ? 0.02 // Under $10 = 2%
        : entry < 20
        ? 0.015 // Under $20 = 1.5%
        : entry < 50
        ? 0.01 // Under $50 = 1%
        : 0.005; // Over $50 = 0.5%

    // Position size scaling - risk gets tighter as position size grows
    const positionScaleFactor = Math.max(
      0.3,
      1 - Math.log10(positionSize) / 10
    );

    // Risk calculation with diminishing returns for higher risk numbers
    const riskScale = Math.sqrt(riskNumber);
    const baseRisk = entry * priceVolatility * riskScale * positionScaleFactor;

    // Reward calculation considering reward ratio with progressive scaling
    const rewardScale = Math.pow(rewardNumber, 0.8); // Progressive reward scaling
    const rewardMultiplier = 1 + rewardScale / 2;

    const stopLoss = entry - baseRisk;
    const target = entry + baseRisk * rewardMultiplier;

    const riskAmount = sharesCount * Math.abs(entry - stopLoss);
    const potentialProfit = sharesCount * Math.abs(target - entry);

    setCalculations({
      stopLoss,
      target,
      shares: sharesCount,
      positionSize,
      riskAmount,
      potentialProfit,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (entryPrice) {
      calculatePosition();
    }
  }, [entryPrice, shares, riskRatio, rewardRatio]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Position Calculator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Price
            </label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk:Reward
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={riskRatio}
                onChange={(e) => setRiskRatio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                min="1"
                step="1"
              />
              <span>:</span>
              <input
                type="number"
                value={rewardRatio}
                onChange={(e) => setRewardRatio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                min="1"
                step="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shares
            </label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              step="1"
              min="0"
            />
          </div>
        </div>

        {calculations && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Position Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Stop Loss</p>
                <p className="text-lg font-medium text-red-600">
                  ${calculations.stopLoss.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-lg font-medium text-green-600">
                  ${calculations.target.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shares</p>
                <p className="text-lg font-medium text-gray-900">
                  {calculations.shares.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Position Size</p>
                <p className="text-lg font-medium text-gray-900">
                  ${calculations.positionSize.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Amount</p>
                <p className="text-lg font-medium text-red-600">
                  ${calculations.riskAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Potential Profit</p>
                <p className="text-lg font-medium text-green-600">
                  ${calculations.potentialProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionCalculatorModal;
