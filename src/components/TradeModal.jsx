// src/components/TradeModal.jsx
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const TradeModal = ({ isOpen, onClose, onSubmit, trade }) => {
  const modalRef = useRef(null);
  const initialFormState = {
    symbol: "",
    type: "LONG",
    entryPrice: "",
    entryDate: "",
    exitPrice: "",
    exitDate: "",
    quantity: "",
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
      // Format dates for datetime-local input
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
      };

      setFormData({
        symbol: trade.symbol || "",
        type: trade.type || "LONG",
        entryPrice: trade.entryPrice || "",
        entryDate: formatDate(trade.entryDate),
        exitPrice: trade.exitPrice || "",
        exitDate: formatDate(trade.exitDate),
        quantity: trade.quantity || "",
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(trade ? { ...formData, _id: trade._id } : formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">
            {trade ? "Edit Trade" : "Add Trade"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full bg-white text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-black mb-1">Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                required
              >
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-black mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="0.01"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-1">
                Entry Date
              </label>
              <input
                type="datetime-local"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-1">
                Exit Price
              </label>
              <input
                type="number"
                step="0.01"
                name="exitPrice"
                value={formData.exitPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-1">Exit Date</label>
              <input
                type="datetime-local"
                name="exitDate"
                value={formData.exitDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-black mb-1">Strategy</label>
              <input
                type="text"
                name="strategy"
                value={formData.strategy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-black mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
              />
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
