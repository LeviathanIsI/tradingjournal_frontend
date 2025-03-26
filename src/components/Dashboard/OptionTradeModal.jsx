import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useTradingStats } from "../../context/TradingStatsContext";

const OptionTradeModal = ({
  isOpen,
  onClose,
  onSubmit,
  trade,
  userTimeZone,
}) => {
  const modalRef = useRef(null);
  const { refreshData } = useTradingStats(); // Add this to get refreshData function

  const initialFormState = {
    symbol: "",
    underlyingPrice: "",
    contractType: "CALL",
    strike: "",
    expiration: "",
    type: "LONG",
    contracts: "",
    entryPrice: "",
    entryDate: "",
    exitPrice: "",
    exitDate: "",
    greeksAtEntry: {
      delta: "",
      gamma: "",
      theta: "",
      vega: "",
      rho: "",
      impliedVolatility: "",
    },
    greeksAtExit: {
      delta: "",
      gamma: "",
      theta: "",
      vega: "",
      rho: "",
      impliedVolatility: "",
    },
    marketConditions: {
      vix: "",
      overallMarketTrend: "NEUTRAL",
    },
    strategy: "",
    setupType: "",
    notes: "",
    mistakes: [],
    tags: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !trade) {
      setFormData(initialFormState);
    }
  }, [isOpen]);

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
    if (trade) {
      setFormData({
        ...initialFormState,
        ...trade,
        expiration: trade.expiration
          ? formatInTimeZone(
              new Date(trade.expiration),
              userTimeZone,
              "yyyy-MM-dd"
            )
          : "",
        entryDate: trade.entryDate
          ? formatInTimeZone(
              new Date(trade.entryDate),
              userTimeZone,
              "yyyy-MM-dd'T'HH:mm"
            )
          : "",
        exitDate: trade.exitDate
          ? formatInTimeZone(
              new Date(trade.exitDate),
              userTimeZone,
              "yyyy-MM-dd'T'HH:mm"
            )
          : "",
        greeksAtEntry: {
          ...initialFormState.greeksAtEntry,
          ...(trade.greeksAtEntry || {}),
        },
        greeksAtExit: {
          ...initialFormState.greeksAtExit,
          ...(trade.greeksAtExit || {}),
        },
        marketConditions: {
          ...initialFormState.marketConditions,
          ...(trade.marketConditions || {}),
        },
        mistakes: trade.mistakes || [],
        tags: trade.tags || [],
      });
    }
  }, [trade, userTimeZone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }
      return {
        ...prev,
        [name]: name === "symbol" ? value.toUpperCase() : value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        contracts: Number(formData.contracts),
        strike: Number(formData.strike),
        entryPrice: Number(formData.entryPrice),
        underlyingPrice: Number(formData.underlyingPrice),
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        greeksAtEntry: {
          delta: formData.greeksAtEntry.delta
            ? Number(formData.greeksAtEntry.delta)
            : undefined,
          gamma: formData.greeksAtEntry.gamma
            ? Number(formData.greeksAtEntry.gamma)
            : undefined,
          theta: formData.greeksAtEntry.theta
            ? Number(formData.greeksAtEntry.theta)
            : undefined,
          vega: formData.greeksAtEntry.vega
            ? Number(formData.greeksAtEntry.vega)
            : undefined,
          rho: formData.greeksAtEntry.rho
            ? Number(formData.greeksAtEntry.rho)
            : undefined,
          impliedVolatility: formData.greeksAtEntry.impliedVolatility
            ? Number(formData.greeksAtEntry.impliedVolatility)
            : undefined,
        },
      };

      await onSubmit(submissionData);

      // Add this line to refresh stats after successful submission
      setTimeout(() => refreshData(), 300); // Small delay to ensure backend has processed

      onClose();
    } catch (error) {
      console.error("Error submitting option trade:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800/90 round-sm border border-gray-200 dark:border-gray-700/60 p-6 w-full max-w-6xl h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            {trade ? "Edit Option Trade" : "Add Option Trade"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Symbol
              </label>
              <input
                type="text"
                name="symbol"
                autoComplete="off"
                value={formData.symbol}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Type
              </label>
              <select
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              >
                <option value="CALL">Call</option>
                <option value="PUT">Put</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              >
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>
          </div>

          {/* Price Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Strike Price
              </label>
              <input
                type="number"
                name="strike"
                value={formData.strike}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Underlying Price
              </label>
              <input
                type="number"
                name="underlyingPrice"
                value={formData.underlyingPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contracts
              </label>
              <input
                type="number"
                name="contracts"
                value={formData.contracts}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                name="expiration"
                value={formData.expiration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              />
            </div>
          </div>

          {/* Entry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entry Price (per contract)
              </label>
              <input
                type="number"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entry Date & Time
              </label>
              <input
                type="datetime-local"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                required
              />
            </div>
          </div>

          {/* Exit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exit Price (per contract)
              </label>
              <input
                type="number"
                name="exitPrice"
                value={formData.exitPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exit Date & Time
              </label>
              <input
                type="datetime-local"
                name="exitDate"
                value={formData.exitDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              />
            </div>
          </div>

          {/* Greeks at Entry */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Greeks at Entry
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.keys(formData.greeksAtEntry).map((greek) => (
                <div key={greek}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {greek === "impliedVolatility" ? "IV" : greek}
                  </label>
                  <input
                    type="number"
                    name={`greeksAtEntry.${greek}`}
                    value={formData.greeksAtEntry[greek]}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                    bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Market Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                VIX
              </label>
              <input
                type="number"
                name="marketConditions.vix"
                value={formData.marketConditions.vix}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Market Trend
              </label>
              <select
                name="marketConditions.overallMarketTrend"
                value={formData.marketConditions.overallMarketTrend}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              >
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
                <option value="Neutral">Neutral</option>
                <option value="Volatile">Volatile</option>
              </select>
            </div>
          </div>

          {/* Strategy & Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Strategy
              </label>
              <select
                name="strategy"
                value={formData.strategy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              >
                <option value="">Select Strategy</option>
                <option value="COVERED_CALL">Covered Call</option>
                <option value="NAKED_CALL">Naked Call</option>
                <option value="LONG_CALL">Long Call</option>
                <option value="PUT_WRITE">Put Write</option>
                <option value="LONG_PUT">Long Put</option>
                <option value="IRON_CONDOR">Iron Condor</option>
                <option value="BUTTERFLY">Butterfly</option>
                <option value="CALENDAR_SPREAD">Calendar Spread</option>
                <option value="DIAGONAL_SPREAD">Diagonal Spread</option>
                <option value="VERTICAL_SPREAD">Vertical Spread</option>
                <option value="STRADDLE">Straddle</option>
                <option value="STRANGLE">Strangle</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Setup Type
              </label>
              <select
                name="setupType"
                value={formData.setupType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              >
                <option value="">Select Setup</option>
                <option value="MOMENTUM">Momentum</option>
                <option value="REVERSAL">Reversal</option>
                <option value="VOLATILITY_EXPANSION">
                  Volatility Expansion
                </option>
                <option value="VOLATILITY_CONTRACTION">
                  Volatility Contraction
                </option>
                <option value="EARNINGS_PLAY">Earnings Play</option>
                <option value="TECHNICAL_LEVEL">Technical Level</option>
                <option value="GAMMA_SCALP">Gamma Scalp</option>
                <option value="THETA_DECAY">Theta Decay</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Mistakes & Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mistakes Made
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  "Early Entry",
                  "Late Entry",
                  "Early Exit",
                  "Late Exit",
                  "Wrong Strike Selection",
                  "Wrong Expiration Selection",
                  "Position Sizing",
                  "Ignored Market Conditions",
                  "Earnings Mistake",
                  "Gamma Risk",
                  "Theta Decay Miscalculation",
                  "Vega Risk",
                  "Other",
                ].map((mistake) => (
                  <label key={mistake} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.mistakes.includes(mistake)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            mistakes: [...formData.mistakes, mistake],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            mistakes: formData.mistakes.filter(
                              (m) => m !== mistake
                            ),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500/30"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {mistake.replace(/_/g, " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                placeholder="Add any additional notes about the trade..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 round-sm hover:bg-gray-50 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 border border-transparent round-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
            >
              {loading ? "Saving..." : trade ? "Update Trade" : "Add Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OptionTradeModal;
