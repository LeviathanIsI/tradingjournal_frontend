// src/components/TradePlanModal.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const TradePlanModal = ({ isOpen, onClose, onSubmit, plan }) => {
  const initialFormState = {
    ticker: "",
    direction: "LONG",
    attributes: {
      lowFloat: false,
      upMoreThan10Percent: false,
      unusualVolume: false,
      formerRunner: false,
      hasCatalyst: false,
      wholeHalfDollarBreak: false,
      clearSupport: false,
    },
    quality: {
      float: null,
      supportArea: null,
      catalystRating: null,
    },
    setup: {
      entry: {
        price: null,
        description: null,
      },
      setupGrade: null,
    },
    execution: {
      entry: null,
      profitTarget: null,
      stopLoss: null,
    },
    notes: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData(initialFormState);
    } else if (plan) {
      // Load plan data when editing
      setFormData(plan);
    } else {
      // Reset to initial state for new trade
      setFormData(initialFormState);
    }
  }, [isOpen, plan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Remove any fields that shouldn't be sent to the backend
      const submissionData = { ...formData };
      delete submissionData._id;
      delete submissionData.__v;
      delete submissionData.createdAt;
      delete submissionData.updatedAt;
      delete submissionData.user;

      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error saving trade plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]:
            type === "checkbox"
              ? checked
              : type === "number"
              ? value === ""
                ? null
                : Number(value)
              : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? value === ""
              ? null
              : Number(value)
            : value,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[90vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {plan ? "Edit Trade Plan" : "New Trade Plan"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
            text-gray-500 dark:text-gray-400"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ticker
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  name="ticker"
                  value={formData.ticker}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
                bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Direction
                </label>
                <select
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="LONG">Long</option>
                  <option value="SHORT">Short</option>
                  <option value="SWING">Swing</option>
                </select>
              </div>
            </div>

            {/* Trade Attributes */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Trade Attributes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-2">
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <input
                      type="checkbox"
                      name="attributes.lowFloat"
                      checked={formData.attributes.lowFloat}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Low Float
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <input
                      type="checkbox"
                      name="attributes.upMoreThan10Percent"
                      checked={formData.attributes.upMoreThan10Percent}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Up more than 10%
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <input
                      type="checkbox"
                      name="attributes.unusualVolume"
                      checked={formData.attributes.unusualVolume}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Have Unusual Volume
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <input
                      type="checkbox"
                      name="attributes.formerRunner"
                      checked={formData.attributes.formerRunner}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Former Runner
                    </span>
                  </label>
                </div>
                <div className="space-y-3 sm:space-y-2">
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <input
                      type="checkbox"
                      name="attributes.hasCatalyst"
                      checked={formData.attributes.hasCatalyst}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Has Catalyst
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <input
                      type="checkbox"
                      name="attributes.wholeHalfDollarBreak"
                      checked={formData.attributes.wholeHalfDollarBreak}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Whole/Half $ Break
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <input
                      type="checkbox"
                      name="attributes.clearSupport"
                      checked={formData.attributes.clearSupport}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Clear Support
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Quality of Setup
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Float
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="quality.float"
                    value={formData.quality.float || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Support Area
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="quality.supportArea"
                    value={formData.quality.supportArea || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catalyst Rating (1-10)
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="quality.catalystRating"
                    value={formData.quality.catalystRating || ""}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Setup Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Setup Grade
              </label>
              <select
                name="setup.setupGrade"
                value={formData.setup.setupGrade || ""}
                onChange={handleChange}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Grade</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </select>
            </div>

            {/* Execution Plan */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Execution Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Entry
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="execution.entry"
                    value={formData.execution.entry || ""}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profit Target
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="execution.profitTarget"
                    value={formData.execution.profitTarget || ""}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stop Loss
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="execution.stopLoss"
                    value={formData.execution.stopLoss || ""}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                autoComplete="off"
                value={formData.notes || ""}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded 
      bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
      hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded 
      hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 text-sm"
              >
                {loading
                  ? plan
                    ? "Updating..."
                    : "Creating..."
                  : plan
                  ? "Update Plan"
                  : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradePlanModal;
