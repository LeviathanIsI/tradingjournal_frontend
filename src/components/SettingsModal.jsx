// src/components/SettingsModal.jsx
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const SettingsModal = ({ isOpen, onClose, currentSettings, onSubmit }) => {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    startingCapital: "",
    defaultCurrency: currentSettings?.defaultCurrency || "USD",
  });
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
    if (currentSettings?.startingCapital) {
      setFormData((prev) => ({
        ...prev,
        startingCapital: currentSettings.startingCapital,
      }));
    }
  }, [currentSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "startingCapital" && value !== "") {
      // Only allow positive numbers
      const num = parseFloat(value);
      if (num >= 0) {
        setFormData((prev) => ({
          ...prev,
          [name]: num,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startingCapital: formData.startingCapital,
          defaultCurrency: formData.defaultCurrency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      await onSubmit(formData);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Account Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full bg-white text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-black mb-1">
                Starting Capital
              </label>
              <input
                type="number"
                name="startingCapital"
                step="0.01"
                min="0"
                value={formData.startingCapital}
                onChange={handleChange}
                placeholder="Enter your starting capital"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-1">Currency</label>
              <select
                name="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
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
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
