import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";

const convertToUTC = (date, timeZone) => {
  const offset = getTimezoneOffset(timeZone);
  const localDate = new Date(date);
  return new Date(localDate.getTime() + offset);
};

const TradeModal = ({ isOpen, onClose, onSubmit, trade, userTimeZone }) => {
  const modalRef = useRef(null);
  const initialFormState = {
    symbol: "",
    type: "LONG",
    tradeType: "DAY",
    entryPrice: "",
    entryQuantity: "",
    entryDate: "",
    exitPrice: "",
    exitQuantity: "",
    exitDate: "",
    postExitHigh: "",
    postExitLow: "",
    pattern: "",
    session: "Regular",
    mentalState: { focus: "", emotion: "" },
    mistakes: [],
    strategy: "",
    notes: "",
  };

  const [formData, setFormData] = useState({ ...initialFormState });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !trade) {
      setFormData({ ...initialFormState });
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
    console.log("Trade prop changed:", trade);
    if (trade) {
      setFormData({
        symbol: trade.symbol || "",
        type: trade.type || "LONG",
        tradeType: trade.tradeType || "DAY",
        entryPrice: trade.entryPrice?.toString() || "",
        entryQuantity: trade.entryQuantity?.toString() || "",
        entryDate: trade.entryDate
          ? formatInTimeZone(
              new Date(trade.entryDate),
              userTimeZone,
              "yyyy-MM-dd'T'HH:mm"
            )
          : "",
        exitPrice: trade.exitPrice?.toString() || "",
        exitQuantity: trade.exitQuantity?.toString() || "",
        exitDate: trade.exitDate
          ? formatInTimeZone(
              new Date(trade.exitDate),
              userTimeZone,
              "yyyy-MM-dd'T'HH:mm"
            )
          : "",
        postExitHigh: trade.postExitHigh?.toString() || "",
        postExitLow: trade.postExitLow?.toString() || "",
        pattern: trade.pattern || "",
        session: trade.session || "Regular",
        mentalState: trade.mentalState || { focus: "", emotion: "" },
        mistakes: trade.mistakes || [],
        strategy: trade.strategy || "",
        notes: trade.notes || "",
      });
    } else {
      console.log("Resetting to initial state");
      setFormData({ ...initialFormState });
    }
  }, [trade, userTimeZone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "symbol") {
        return {
          ...prev,
          [name]: value.toUpperCase(),
        };
      }
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
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !formData.symbol ||
        !formData.type ||
        !formData.tradeType ||
        !formData.entryPrice ||
        !formData.entryQuantity ||
        !formData.entryDate
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Validate day trade dates
      if (formData.tradeType === "DAY" && formData.exitDate) {
        const entryDay = new Date(formData.entryDate).toDateString();
        const exitDay = new Date(formData.exitDate).toDateString();

        if (entryDay !== exitDay) {
          setLoading(false);
          alert("Day trades must have entry and exit on the same day");
          return;
        }
      }

      // Transform data for submission
      const submissionData = {
        symbol: formData.symbol.toUpperCase(),
        type: formData.type,
        tradeType: formData.tradeType,
        entryDate: convertToUTC(
          new Date(formData.entryDate),
          userTimeZone
        ).toISOString(),
        entryQuantity: Number(formData.entryQuantity),
        exitDate: formData.exitDate
          ? convertToUTC(
              new Date(formData.exitDate),
              userTimeZone
            ).toISOString()
          : undefined,
        postExitHigh: formData.postExitHigh
          ? Number(parseFloat(formData.postExitHigh).toFixed(4))
          : null,
        postExitLow: formData.postExitLow
          ? Number(parseFloat(formData.postExitLow).toFixed(4))
          : null,
        pattern: formData.pattern || null,
        session: formData.session,
        mentalState: formData.mentalState,
        mistakes: formData.mistakes,
        strategy: formData.strategy || "",
        notes: formData.notes || "",
      };

      // Only include exit fields if they all exist
      if (formData.exitPrice && formData.exitQuantity && formData.exitDate) {
        submissionData.exitPrice = Number(formData.exitPrice);
        submissionData.exitQuantity = Number(formData.exitQuantity);
        submissionData.exitDate = new Date(formData.exitDate).toISOString();
      }

      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error("Error submitting trade:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {trade ? "Edit Trade" : "Add Trade"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 uppercase"
                  required
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  required
                >
                  <option value="LONG">Long</option>
                  <option value="SHORT">Short</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Trade Type
                </label>
                <select
                  name="tradeType"
                  value={formData.tradeType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  required
                >
                  <option value="DAY">Day Trade</option>
                  <option value="SWING">Swing Trade</option>
                </select>
              </div>
            </div>

            {/* Entry Details */}
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Entry Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="entryQuantity"
                    value={formData.entryQuantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="entryPrice"
                    value={formData.entryPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    min="0"
                    step="0.0001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Exit Details */}
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Exit Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="exitQuantity"
                    value={formData.exitQuantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="exitPrice"
                    value={formData.exitPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    min="0"
                    step="0.0001"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="exitDate"
                    value={formData.exitDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Post-Exit Analysis */}
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Post-Exit Price Movement
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Stock High After Exit
                  </label>
                  <input
                    type="number"
                    name="postExitHigh"
                    value={formData.postExitHigh}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Stock Low After Exit
                  </label>
                  <input
                    type="number"
                    name="postExitLow"
                    value={formData.postExitLow}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    step="0.0001"
                  />
                </div>
              </div>
            </div>

            {/* Pattern and Session */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Trade Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Pattern
                  </label>
                  <select
                    name="pattern"
                    value={formData.pattern || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  >
                    <option value="">Select Pattern</option>
                    <option value="Gap Up">Gap Up</option>
                    <option value="Gap Down">Gap Down</option>
                    <option value="Breakout">Breakout</option>
                    <option value="Breakdown">Breakdown</option>
                    <option value="Reversal">Reversal</option>
                    <option value="Trend Following">Trend Following</option>
                    <option value="Range Play">Range Play</option>
                    <option value="VWAP Play">VWAP Play</option>
                    <option value="Opening Range">Opening Range</option>
                    <option value="First Pullback">First Pullback</option>
                    <option value="RCT">RCT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Session
                  </label>
                  <select
                    name="session"
                    value={formData.session || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    required
                  >
                    <option value="Pre-Market">Pre-Market</option>
                    <option value="Regular">Regular Hours</option>
                    <option value="After-Hours">After Hours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mental State */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Psychology
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Focus Level (1-10)
                  </label>
                  <input
                    type="number"
                    name="mentalState.focus"
                    value={formData.mentalState?.focus || ""}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Emotion
                  </label>
                  <select
                    name="mentalState.emotion"
                    value={formData.mentalState?.emotion || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  >
                    <option value="">Select Emotion</option>
                    <option value="Calm">Calm</option>
                    <option value="Excited">Excited</option>
                    <option value="Fearful">Fearful</option>
                    <option value="Confident">Confident</option>
                    <option value="Frustrated">Frustrated</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mistakes */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Trade Review
              </h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Mistakes Made
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "FOMO",
                    "Sized Too Big",
                    "Poor Entry",
                    "Poor Exit",
                    "No Stop Loss",
                    "Moved Stop Loss",
                    "Break Trading Rules",
                    "Chasing",
                    "Revenge Trading",
                    "Other",
                  ].map((mistake) => (
                    <label key={mistake} className="flex items-center">
                      <input
                        type="checkbox"
                        name="mistakes"
                        value={mistake}
                        checked={formData.mistakes?.includes(mistake)}
                        onChange={(e) => {
                          const value = e.target.value;
                          const isChecked = e.target.checked;
                          handleChange({
                            target: {
                              name: "mistakes",
                              value: isChecked
                                ? [...(formData.mistakes || []), value]
                                : formData.mistakes?.filter(
                                    (m) => m !== value
                                  ) || [],
                            },
                          });
                        }}
                        className="h-4 w-4 text-blue-600 bg-white rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        {mistake}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Strategy
                  </label>
                  <input
                    type="text"
                    name="strategy"
                    value={formData.strategy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? trade
                  ? "Updating..."
                  : "Adding..."
                : trade
                ? "Update Trade"
                : "Add Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;
