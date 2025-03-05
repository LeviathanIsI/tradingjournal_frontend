// src/components/TradeImport.jsx
import { useState } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";

const TradeImport = ({ onImport }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [columnMap, setColumnMap] = useState({});
  const [step, setStep] = useState("upload");

  const tradeFields = [
    { key: "symbol", label: "Symbol", required: true },
    { key: "type", label: "Trade Type (LONG/SHORT)", required: true },
    { key: "entryPrice", label: "Entry Price", required: true },
    { key: "entryQuantity", label: "Entry Quantity", required: true },
    { key: "entryDate", label: "Entry Date", required: true },
    { key: "exitPrice", label: "Exit Price", required: true },
    { key: "exitQuantity", label: "Exit Quantity", required: true },
    { key: "exitDate", label: "Exit Date", required: true },
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setLoading(true);
    setError(null);

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results);
          setStep("map");
          setLoading(false);
        },
        error: (error) => {
          setError("Error parsing CSV file");
          setLoading(false);
        },
      });
    }
  };

  const handleColumnMap = (tradeField, csvColumn) => {
    setColumnMap((prev) => ({
      ...prev,
      [tradeField]: csvColumn,
    }));
  };

  const processData = () => {
    if (!csvData) return;

    const processedTrades = csvData.data.map((row) => {
      const trade = {};

      // Map CSV columns to trade fields
      Object.entries(columnMap).forEach(([tradeField, csvColumn]) => {
        trade[tradeField] = row[csvColumn];
      });

      // Add any required transformations here
      if (trade.entryPrice) trade.entryPrice = parseFloat(trade.entryPrice);
      if (trade.exitPrice) trade.exitPrice = parseFloat(trade.exitPrice);
      if (trade.entryQuantity)
        trade.entryQuantity = parseInt(trade.entryQuantity);
      if (trade.exitQuantity) trade.exitQuantity = parseInt(trade.exitQuantity);
      if (trade.entryDate) trade.entryDate = new Date(trade.entryDate);
      if (trade.exitDate) trade.exitDate = new Date(trade.exitDate);

      return trade;
    });

    return processedTrades;
  };

  const handleImport = async () => {
    try {
      const processedTrades = processData();
      await onImport(processedTrades);
      setStep("upload");
      setCsvData(null);
      setColumnMap({});
    } catch (err) {
      setError(err.message);
    }
  };

  if (step === "map" && csvData) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Map CSV Columns</h3>
        <div className="space-y-4">
          {tradeFields.map((field) => (
            <div key={field.key} className="flex items-center space-x-4">
              <label className="w-1/3">{field.label}</label>
              <select
                className="w-2/3 p-2 border rounded"
                value={columnMap[field.key] || ""}
                onChange={(e) => handleColumnMap(field.key, e.target.value)}
              >
                <option value="">Select Column</option>
                {csvData.meta.fields.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-4 space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleImport}
          >
            Import Trades
          </button>
          <button
            className="px-4 py-2 border rounded"
            onClick={() => setStep("upload")}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <div className="flex flex-col items-center space-y-4">
        <label className="flex flex-col items-center px-4 py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">
            {loading ? "Processing..." : "Select CSV file"}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default TradeImport;
