import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";

const convertToUTC = (date, timeZone) => {
  const offset = getTimezoneOffset(timeZone);
  const localDate = new Date(date);
  return new Date(localDate.getTime() - offset);
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
    postExitAnalysis: {
      lowBeforeHigh: null,
      timeOfLow: "",
      timeOfHigh: "",
    },
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
        postExitAnalysis: {
          lowBeforeHigh: trade.postExitAnalysis?.lowBeforeHigh ?? null,
          timeOfLow: trade.postExitAnalysis?.timeOfLow
            ? formatInTimeZone(
                new Date(trade.postExitAnalysis.timeOfLow),
                userTimeZone,
                "HH:mm"
              )
            : "",
          timeOfHigh: trade.postExitAnalysis?.timeOfHigh
            ? formatInTimeZone(
                new Date(trade.postExitAnalysis.timeOfHigh),
                userTimeZone,
                "HH:mm"
              )
            : "",
        },
      });
    } else {
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

      // Transform data for submission
      const submissionData = {
        symbol: formData.symbol.toUpperCase(),
        type: formData.type,
        tradeType: formData.tradeType,
        entryPrice: Number(formData.entryPrice),
        entryDate: new Date(formData.entryDate).toISOString(),
        entryQuantity: Number(formData.entryQuantity),
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
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
        postExitAnalysis: {
          lowBeforeHigh: formData.postExitAnalysis?.lowBeforeHigh || null,
        },
      };

      // Validate day trade dates - FIXED VERSION
      if (formData.tradeType === "DAY" && formData.exitDate) {
        // First, check with 24-hour validation
        const entryDate = new Date(formData.entryDate);
        const exitDate = new Date(formData.exitDate);
        const hoursDifference =
          Math.abs(exitDate - entryDate) / (1000 * 60 * 60);

        if (hoursDifference > 24) {
          setLoading(false);
          alert("Day trades must have entry and exit within 24 hours");
          return;
        }

        // Add a special validation field instead of changing the original date
        submissionData._validationSameDayAs = new Date(formData.entryDate)
          .toISOString()
          .split("T")[0];
      }

      // Only include exit fields if they all exist
      if (formData.exitPrice && formData.exitQuantity && formData.exitDate) {
        submissionData.exitPrice = Number(formData.exitPrice);
        submissionData.exitQuantity = Number(formData.exitQuantity);
        submissionData.exitDate = new Date(formData.exitDate).toISOString();
      }

      // Process time inputs if they exist
      if (formData.postExitAnalysis?.timeOfLow && formData.exitDate) {
        const exitDate = new Date(formData.exitDate);
        const [hours, minutes] = formData.postExitAnalysis.timeOfLow.split(":");
        const lowDate = new Date(exitDate);
        lowDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        submissionData.postExitAnalysis.timeOfLow = lowDate.toISOString();
      }

      if (formData.postExitAnalysis?.timeOfHigh && formData.exitDate) {
        const exitDate = new Date(formData.exitDate);
        const [hours, minutes] =
          formData.postExitAnalysis.timeOfHigh.split(":");
        const highDate = new Date(exitDate);
        highDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        submissionData.postExitAnalysis.timeOfHigh = highDate.toISOString();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-700/60 rounded-sm p-4 sm:p-6 w-full max-w-6xl h-[90vh] sm:max-h-[80vh] 
        overflow-y-auto border border-gray-200 dark:border-gray-600/50 shadow-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {trade ? "Edit Trade" : "Add Trade"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600/70 
            text-gray-500 dark:text-gray-400"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Symbol
              </label>
              <input
                type="text"
                autoComplete="off"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                required
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Trade Type
              </label>
              <select
                name="tradeType"
                value={formData.tradeType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="DAY">Day Trade</option>
                <option value="SWING">Swing Trade</option>
              </select>
            </div>

            {/* Entry Details */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 col-span-1 sm:col-span-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Entry Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="entryQuantity"
                    value={formData.entryQuantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="entryPrice"
                    value={formData.entryPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                    min="0"
                    step="0.000001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Exit Details */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 col-span-1 sm:col-span-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Exit Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="exitQuantity"
                    value={formData.exitQuantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="exitPrice"
                    value={formData.exitPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                    min="0"
                    step="0.000001"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="exitDate"
                    value={formData.exitDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Post-Exit Analysis */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 col-span-1 sm:col-span-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Post-Exit Price Movement
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Stock High After Exit
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="postExitHigh"
                    value={formData.postExitHigh}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                    step="0.000001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Stock Low After Exit
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="postExitLow"
                    value={formData.postExitLow}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                    step="0.000001"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4 col-span-1 sm:col-span-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Time of Day High
                  </label>
                  <input
                    type="time"
                    name="postExitAnalysis.timeOfHigh"
                    value={formData.postExitAnalysis?.timeOfHigh || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter when the stock hit its high
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Time of Day Low
                  </label>
                  <input
                    type="time"
                    name="postExitAnalysis.timeOfLow"
                    value={formData.postExitAnalysis?.timeOfLow || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter when the stock hit its low
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="postExitAnalysis.lowBeforeHigh"
                    checked={formData.postExitAnalysis?.lowBeforeHigh || false}
                    onChange={(e) => {
                      handleChange({
                        target: {
                          name: "postExitAnalysis.lowBeforeHigh",
                          value: e.target.checked,
                        },
                      });
                    }}
                    className="h-4 w-4 text-blue-600 bg-white dark:bg-gray-600/50 rounded-sm 
                    border-gray-300 dark:border-gray-600/70 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Low occurred before high
                  </span>
                </label>
              </div>
            </div>
            {/* Pattern and Session */}
            <div className="border-t dark:border-gray-600/50 pt-4 col-span-1 sm:col-span-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Trade Analysis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Pattern
                  </label>
                  <select
                    name="pattern"
                    value={formData.pattern || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
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
                    <option value="ABCD Pattern">ABCD Pattern</option>
                    <option value="1st Green Day">1st Green Day</option>
                    <option value="1st Red Day">1st Red Day</option>
                    <option value="RCT">RCT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Session
                  </label>
                  <select
                    name="session"
                    value={formData.session || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
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
            <div className="border-t dark:border-gray-600/50 pt-4 col-span-1 sm:col-span-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Psychology
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Focus Level (1-10)
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Decrement Button */}
                    <button
                      type="button"
                      className="p-2 border border-gray-300 dark:border-gray-600/70 rounded-sm bg-gray-200 dark:bg-gray-600/50 hover:bg-gray-300 
                      dark:hover:bg-gray-600/70 text-black dark:text-white"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          mentalState: {
                            ...formData.mentalState,
                            focus: Math.max(
                              1,
                              (parseInt(formData.mentalState?.focus) || 1) - 1
                            ),
                          },
                        })
                      }
                    >
                      -
                    </button>

                    {/* Dropdown Select */}
                    <select
                      name="mentalState.focus"
                      value={formData.mentalState?.focus || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mentalState: {
                            ...formData.mentalState,
                            focus: Number(e.target.value),
                          },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                      bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                    >
                      {[...Array(10).keys()].map((num) => (
                        <option key={num + 1} value={num + 1}>
                          {num + 1}
                        </option>
                      ))}
                    </select>

                    {/* Increment Button */}
                    <button
                      type="button"
                      className="p-2 border border-gray-300 dark:border-gray-600/70 rounded-sm bg-gray-200 dark:bg-gray-600/50 hover:bg-gray-300 
                      dark:hover:bg-gray-600/70 text-black dark:text-white"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          mentalState: {
                            ...formData.mentalState,
                            focus: Math.min(
                              10,
                              (parseInt(formData.mentalState?.focus) || 1) + 1
                            ),
                          },
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Emotion
                  </label>
                  <select
                    name="mentalState.emotion"
                    value={formData.mentalState?.emotion || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
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
            <div className="border-t dark:border-gray-600/50 pt-4 col-span-1 sm:col-span-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Trade Review
              </h3>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Mistakes Made
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
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
                    <label
                      key={mistake}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600/30 rounded-sm"
                    >
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
                        className="h-4 w-4 text-blue-600 bg-white dark:bg-gray-600/50 rounded-sm 
                        border-gray-300 dark:border-gray-600/70 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {mistake}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t dark:border-gray-600/50 pt-4 col-span-1 sm:col-span-4">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Strategy
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="strategy"
                    value={formData.strategy}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    autoComplete="off"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                    bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div
              className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 
              border-t dark:border-gray-600/50 pt-4 col-span-1 sm:col-span-4"
            >
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                bg-white dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 
                hover:bg-gray-50 dark:hover:bg-gray-600/70 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-sm 
                hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 text-sm sm:text-base"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;
