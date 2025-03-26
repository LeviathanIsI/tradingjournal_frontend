// src/components/TradeImport.jsx
import { useState } from "react";
import { Upload, X, Check } from "lucide-react";
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
      <div className="bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/60 round-sm shadow-sm p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Map CSV Columns
        </h3>
        <div className="space-y-4">
          {tradeFields.map((field) => (
            <div
              key={field.key}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
            >
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full sm:w-1/3">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                className="w-full sm:w-2/3 px-3 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
                bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 
                focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
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
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 border-t dark:border-gray-700/40 pt-4">
          <button
            className="px-4 py-2 border border-gray-300 dark:border-gray-600/70 round-sm 
            bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 
            hover:bg-gray-50 dark:hover:bg-gray-600/70 text-sm sm:text-base"
            onClick={() => setStep("upload")}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 dark:bg-blue-600/90 hover:bg-blue-700 dark:hover:bg-blue-500 
            text-white round-sm shadow-sm text-sm sm:text-base"
            onClick={handleImport}
          >
            Import Trades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/60 round-sm shadow-sm">
      <div className="p-6 flex flex-col items-center space-y-4">
        <label
          className="flex flex-col items-center justify-center w-full sm:w-2/3 h-40 px-4 py-6 
          bg-gray-50 dark:bg-gray-700/40 border-2 border-dashed 
          border-gray-300 dark:border-gray-600/70 round-sm cursor-pointer 
          hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        >
          <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
          <span className="text-base font-medium text-gray-700 dark:text-gray-300">
            Click to select a CSV file
          </span>
          <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {loading ? "Processing..." : "Support for stock and option trades"}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>

        {error && (
          <div
            className="w-full sm:w-2/3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 
            p-3 round-sm border border-red-200 dark:border-red-700/50 text-sm flex items-start"
          >
            <X className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="w-full sm:w-2/3 text-center mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your CSV should include columns for symbol, entry/exit prices,
            quantities, and dates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradeImport;
