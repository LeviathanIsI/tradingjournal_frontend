import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";

const TradeModal = ({ isOpen, onClose, onSubmit, trade }) => {
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
    strategy: "",
    notes: "",
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

  useEffect(() => {
    if (trade) {
      setFormData({
        symbol: trade.symbol || "",
        type: trade.type || "LONG",
        tradeType: trade.tradeType || "DAY",
        entryPrice: trade.entryPrice?.toString() || "",
        entryQuantity: trade.entryQuantity?.toString() || "",
        entryDate: trade.entryDate
          ? new Date(trade.entryDate).toISOString().slice(0, 16)
          : "",
        exitPrice: trade.exitPrice?.toString() || "",
        exitQuantity: trade.exitQuantity?.toString() || "",
        exitDate: trade.exitDate
          ? new Date(trade.exitDate).toISOString().slice(0, 16)
          : "",
        strategy: trade.strategy || "",
        notes: trade.notes || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [trade]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If it's a day trade and entry date changes, update exit date
    if (
      name === "entryDate" &&
      formData.tradeType === "DAY" &&
      formData.exitDate
    ) {
      const newDate = value.split("T")[0];
      const exitTime = formData.exitDate.split("T")[1];
      setFormData((prev) => ({
        ...prev,
        exitDate: `${newDate}T${exitTime}`,
      }));
    }

    // If changing to day trade, update exit date to match entry date
    if (
      name === "tradeType" &&
      value === "DAY" &&
      formData.entryDate &&
      formData.exitDate
    ) {
      const entryDate = formData.entryDate.split("T")[0];
      const exitTime = formData.exitDate.split("T")[1];
      setFormData((prev) => ({
        ...prev,
        exitDate: `${entryDate}T${exitTime}`,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.symbol ||
        !formData.type ||
        !formData.tradeType ||
        !formData.entryPrice ||
        !formData.entryQuantity ||
        !formData.entryDate
      ) {
        console.error("Missing required fields:", {
          symbol: !!formData.symbol,
          type: !!formData.type,
          tradeType: !!formData.tradeType,
          entryPrice: !!formData.entryPrice,
          entryQuantity: !!formData.entryQuantity,
          entryDate: !!formData.entryDate,
        });
        throw new Error("Please fill in all required fields");
      }

      // Transform data for submission
      const submissionData = {
        symbol: formData.symbol.toUpperCase(),
        type: formData.type,
        tradeType: formData.tradeType,
        entryPrice: Number(formData.entryPrice),
        entryQuantity: Number(formData.entryQuantity),
        entryDate: new Date(formData.entryDate).toISOString(),
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-4xl">
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  required
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
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
                    step="0.01"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="entryDate"
                      value={formData.entryDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded bg-white text-gray-900 appearance-none"
                      style={{ width: "250px" }} // Adjust width as necessary
                      required
                    />
                    <FaCalendarAlt
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 cursor-pointer"
                      onClick={() => {
                        const input = document.querySelector(
                          'input[name="entryDate"]'
                        );
                        if (input) input.showPicker();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Exit Details */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Exit Details (Optional)
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
                    step="0.01"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="entryDate"
                      value={formData.entryDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded bg-white text-gray-900 appearance-none"
                      style={{ width: "250px" }} // Adjust width as necessary
                      required
                    />
                    <FaCalendarAlt
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 cursor-pointer"
                      onClick={() => {
                        const input = document.querySelector(
                          'input[name="entryDate"]'
                        );
                        if (input) input.showPicker();
                      }}
                    />
                  </div>
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
