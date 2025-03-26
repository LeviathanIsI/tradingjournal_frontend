// src/components/ImportTradeModal.jsx
import { useState } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";

const ImportTradeModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [mappings, setMappings] = useState({});
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("upload"); // upload, map, preview

  const tradeFields = [
    { key: "symbol", label: "Symbol", required: true },
    { key: "type", label: "Type (LONG/SHORT)", required: true },
    { key: "entryPrice", label: "Entry Price", required: true },
    { key: "entryQuantity", label: "Entry Quantity", required: true },
    { key: "entryDate", label: "Entry Date", required: true },
    { key: "exitPrice", label: "Exit Price", required: true },
    { key: "exitQuantity", label: "Exit Quantity", required: true },
    { key: "exitDate", label: "Exit Date", required: true },
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewData(results);
          setStep("map");
        },
        error: (error) => {
          setError("Error parsing CSV file");
        },
      });
    }
  };

  const handleMapping = (tradeField, csvColumn) => {
    setMappings((prev) => ({
      ...prev,
      [tradeField]: csvColumn,
    }));
  };

  const processData = () => {
    if (!previewData) return [];

    return previewData.data.map((row) => {
      const trade = {};

      Object.entries(mappings).forEach(([tradeField, csvColumn]) => {
        let value = row[csvColumn];

        // Convert data types
        switch (tradeField) {
          case "entryPrice":
          case "exitPrice":
            trade[tradeField] = parseFloat(value);
            break;
          case "entryQuantity":
          case "exitQuantity":
            trade[tradeField] = parseInt(value);
            break;
          case "entryDate":
          case "exitDate":
            trade[tradeField] = new Date(value);
            break;
          case "type":
            // Attempt to determine if LONG/SHORT based on entry/exit prices
            if (!value) {
              const entryPrice = parseFloat(row[mappings.entryPrice]);
              const exitPrice = parseFloat(row[mappings.exitPrice]);
              value = entryPrice < exitPrice ? "LONG" : "SHORT";
            }
            trade[tradeField] = value.toUpperCase();
            break;
          default:
            trade[tradeField] = value;
        }
      });

      return trade;
    });
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      const processedData = processData();
      await onImport(processedData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-sm p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import Trades</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {step === "upload" && (
          <div className="flex flex-col items-center p-6">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-sm border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-gray-500">Select CSV file</span>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}

        {step === "map" && previewData && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Map your CSV columns to trade fields
            </p>
            {tradeFields.map((field) => (
              <div key={field.key} className="flex items-center gap-4">
                <label className="w-1/3 text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <select
                  className="w-2/3 p-2 border rounded"
                  value={mappings[field.key] || ""}
                  onChange={(e) => handleMapping(field.key, e.target.value)}
                >
                  <option value="">Select column</option>
                  {previewData.meta.fields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setStep("upload")}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Importing..." : "Import Trades"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportTradeModal;
