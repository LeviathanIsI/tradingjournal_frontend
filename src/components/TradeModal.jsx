// src/components/TradeModal.jsx
import { useState, useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";

const TradeModal = ({ isOpen, onClose, onSubmit, trade }) => {
  const modalRef = useRef(null);
  const initialFormState = {
    symbol: "",
    type: "LONG",
    tradeType: "DAY",
    strategy: "",
    notes: "",
    legs: [
      {
        quantity: "",
        price: "",
        date: "",
        type: "ENTRY",
      },
    ],
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
        strategy: trade.strategy || "",
        notes: trade.notes || "",
        legs: trade.legs || [
          { quantity: "", price: "", date: "", type: "ENTRY" },
        ],
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

    // If it's a day trade, update exit dates to match entry dates
    if (name === "tradeType" && value === "DAY") {
      const entryLegs = formData.legs.filter((leg) => leg.type === "ENTRY");
      if (entryLegs.length > 0) {
        const entryDate = entryLegs[0].date.split("T")[0]; // Get just the date part
        setFormData((prev) => ({
          ...prev,
          legs: prev.legs.map((leg) => {
            if (leg.type === "EXIT") {
              return {
                ...leg,
                date: leg.date
                  ? `${entryDate}T${leg.date.split("T")[1]}`
                  : leg.date,
              };
            }
            return leg;
          }),
        }));
      }
    }
  };

  const handleLegChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      legs: prev.legs.map((leg, i) => {
        if (i === index) {
          const updatedLeg = { ...leg, [name]: value };

          // If it's a day trade and this is an entry leg, update exit leg dates
          if (
            formData.tradeType === "DAY" &&
            leg.type === "ENTRY" &&
            name === "date"
          ) {
            const entryDate = value.split("T")[0];
            prev.legs.forEach((otherLeg, otherIndex) => {
              if (otherLeg.type === "EXIT") {
                const exitTime = prev.legs[otherIndex].date
                  ? prev.legs[otherIndex].date.split("T")[1]
                  : new Date().toTimeString().slice(0, 5);
                prev.legs[otherIndex].date = `${entryDate}T${exitTime}`;
              }
            });
          }

          return updatedLeg;
        }
        return leg;
      }),
    }));
  };

  const addLeg = (type) => {
    setFormData((prev) => ({
      ...prev,
      legs: [...prev.legs, { quantity: "", price: "", date: "", type }],
    }));
  };

  const removeLeg = (index) => {
    setFormData((prev) => ({
      ...prev,
      legs: prev.legs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">
            {trade ? "Edit Trade" : "Add Trade"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Basic Trade Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
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
                <label className="block text-sm text-black mb-1">
                  Trade Type
                </label>
                <select
                  name="tradeType"
                  value={formData.tradeType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                  required
                >
                  <option value="DAY">Day Trade</option>
                  <option value="SWING">Swing Trade</option>
                </select>
              </div>
            </div>

            {/* Trade Legs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Trade Legs</h3>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => addLeg("ENTRY")}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => addLeg("EXIT")}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Add Exit
                  </button>
                </div>
              </div>

              {formData.legs.map((leg, index) => (
                <div key={index} className="border p-4 rounded space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-black">
                      {leg.type === "ENTRY" ? "Entry" : "Exit"} Leg {index + 1}
                    </h4>
                    {formData.legs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLeg(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-black mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={leg.quantity}
                        onChange={(e) => handleLegChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-black mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={leg.price}
                        onChange={(e) => handleLegChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-black mb-1">
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="date"
                        value={leg.date}
                        onChange={(e) => handleLegChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-black mb-1">
                  Strategy
                </label>
                <input
                  type="text"
                  name="strategy"
                  value={formData.strategy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
                />
              </div>

              <div>
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
