// src/components/TradePlanModal.jsx
import { useState, useEffect, useRef } from "react";
import {
  X,
  FileEdit,
  Check,
  AlertTriangle,
  Clipboard,
  ChevronDown,
} from "lucide-react";

const TradePlanModal = ({ isOpen, onClose, onSubmit, plan }) => {
  const modalRef = useRef(null);
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

  // Load plan data when plan changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setFormData({
          ...initialFormState,
          ...plan,
          attributes: {
            ...initialFormState.attributes,
            ...(plan.attributes || {}),
          },
          quality: {
            ...initialFormState.quality,
            ...(plan.quality || {}),
          },
          setup: {
            ...initialFormState.setup,
            ...(plan.setup || {}),
          },
          execution: {
            ...initialFormState.execution,
            ...(plan.execution || {}),
          },
        });
      } else {
        setFormData(initialFormState);
      }
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

  const getGradeColor = (grade) => {
    if (!grade)
      return "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400";
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300";
      case "B":
        return "bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300";
      case "C":
        return "bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300";
      case "D":
      case "F":
        return "bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800/80 rounded-sm w-full max-w-4xl h-[90vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700/60 shadow-lg relative"
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/40 p-4 sm:p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <FileEdit className="h-5 w-5 mr-2 text-primary dark:text-primary-light" />
            {plan ? "Edit Trade Plan" : "New Trade Plan"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 round-sm 
            text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 pt-0 sm:pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-sm p-4 sm:p-5 border border-gray-200/70 dark:border-gray-600/40 mt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Clipboard className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Ticker
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="ticker"
                    value={formData.ticker}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                    bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Direction
                  </label>
                  <div className="relative">
                    <select
                      name="direction"
                      value={formData.direction}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                      bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                      appearance-none"
                      required
                    >
                      <option value="LONG">Long</option>
                      <option value="SHORT">Short</option>
                      <option value="SWING">Swing</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Attributes */}
            <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-sm p-4 sm:p-5 border border-gray-200/70 dark:border-gray-600/40">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
                Trade Attributes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="flex items-center p-2 hover:bg-gray-100/70 dark:hover:bg-gray-600/40 round-sm transition-colors">
                    <input
                      type="checkbox"
                      name="attributes.lowFloat"
                      checked={formData.attributes.lowFloat}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
                      text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Low Float
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-100/70 dark:hover:bg-gray-600/40 round-sm transition-colors">
                    <input
                      type="checkbox"
                      name="attributes.upMoreThan10Percent"
                      checked={formData.attributes.upMoreThan10Percent}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
                      text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Up more than 10%
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-100/70 dark:hover:bg-gray-600/40 round-sm transition-colors">
                    <input
                      type="checkbox"
                      name="attributes.unusualVolume"
                      checked={formData.attributes.unusualVolume}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
                      text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Have Unusual Volume
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-100/70 dark:hover:bg-gray-600/40 round-sm transition-colors">
                    <input
                      type="checkbox"
                      name="attributes.formerRunner"
                      checked={formData.attributes.formerRunner}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
                      text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Former Runner
                    </span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center p-2 hover:bg-gray-100/70 dark:hover:bg-gray-600/40 round-sm transition-colors">
                    <input
                      type="checkbox"
                      name="attributes.hasCatalyst"
                      checked={formData.attributes.hasCatalyst}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
                      text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Has Catalyst
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-100/70 dark:hover:bg-gray-600/40 round-sm transition-colors">
                    <input
                      type="checkbox"
                      name="attributes.wholeHalfDollarBreak"
                      checked={formData.attributes.wholeHalfDollarBreak}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
                      text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Whole/Half $ Break
                    </span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-100/70 dark:hover:bg-gray-600/40 round-sm transition-colors">
                    <input
                      type="checkbox"
                      name="attributes.clearSupport"
                      checked={formData.attributes.clearSupport}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
                      text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Clear Support
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-sm p-4 sm:p-5 border border-gray-200/70 dark:border-gray-600/40">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
                Quality of Setup
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Float
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="quality.float"
                    value={formData.quality.float || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                    bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Support Area
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="quality.supportArea"
                    value={formData.quality.supportArea || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                    bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                    bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Setup Grade
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {["A+", "A", "B", "C", "D", "F"].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            setup: {
                              ...formData.setup,
                              setupGrade: grade,
                            },
                          })
                        }
                        className={`py-2 px-3 round-sm font-medium text-sm border flex items-center justify-center
                        ${
                          formData.setup.setupGrade === grade
                            ? getGradeColor(grade) + " border-transparent"
                            : "border-gray-300 dark:border-gray-600/70 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/40"
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Plan */}
            <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-sm p-4 sm:p-5 border border-gray-200/70 dark:border-gray-600/40">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FileEdit className="h-4 w-4 mr-2 text-primary dark:text-primary-light" />
                Execution Plan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="execution.entry"
                    value={formData.execution.entry || ""}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                    bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Profit Target
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="execution.profitTarget"
                    value={formData.execution.profitTarget || ""}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                    bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Stop Loss
                  </label>
                  <input
                    type="number"
                    autoComplete="off"
                    name="execution.stopLoss"
                    value={formData.execution.stopLoss || ""}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                    bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-sm p-4 sm:p-5 border border-gray-200/70 dark:border-gray-600/40">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes & Observations
              </label>
              <textarea
                name="notes"
                autoComplete="off"
                value={formData.notes || ""}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Add any additional notes, observations, or reminders about this trade plan..."
              />
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700/40 p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3 -mx-4 sm:-mx-6 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600/70 round-sm 
                bg-white dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 
                hover:bg-gray-50 dark:hover:bg-gray-600/70 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white round-sm shadow
                disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
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
