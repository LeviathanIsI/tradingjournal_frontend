import React, { useMemo } from "react";

const StopLossStudy = ({ trades }) => {
  const analysis = useMemo(() => {
    if (!trades?.length) return null;

    const closedTrades = trades.filter((trade) => trade.status === "CLOSED");

    // Get recent trades (last 90 days)
    const now = new Date();
    const recentTrades = closedTrades.filter((trade) => {
      const tradeDate = new Date(trade.exitDate);
      const daysDiff = (now - tradeDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 90;
    });

    // Enhanced volatility and momentum calculation
    const getTradeMetrics = (trade) => {
      if (trade.postExitHigh && trade.postExitLow) {
        const volatility =
          (trade.postExitHigh - trade.postExitLow) / trade.entryPrice;
        const totalMove =
          trade.type === "LONG"
            ? trade.postExitHigh - trade.postExitLow
            : trade.postExitLow - trade.postExitHigh;
        const momentum = Math.abs(totalMove / trade.entryPrice);

        return { volatility, momentum };
      }
      return { volatility: null, momentum: null };
    };

    // Handle winning trades with enhanced analysis
    const winningTrades = closedTrades.filter((t) => t.profitLoss.realized > 0);
    const recentWinningTrades = recentTrades.filter(
      (t) => t.profitLoss.realized > 0
    );

    const suggestedTarget = winningTrades.length
      ? (
          winningTrades.reduce((acc, trade) => {
            const baseMove = Math.abs(trade.exitPrice - trade.entryPrice);
            const isRecent = recentWinningTrades.some(
              (t) => t._id === trade._id
            );
            let weightedMove = baseMove;

            if (trade.postExitHigh !== null && trade.postExitLow !== null) {
              const { volatility, momentum } = getTradeMetrics(trade);
              const potentialMove =
                trade.type === "LONG"
                  ? trade.postExitHigh - trade.entryPrice
                  : trade.entryPrice - trade.postExitLow;

              // Momentum-based adjustment
              if (momentum) {
                if (momentum > 0.02) {
                  weightedMove *= 1.2; // 20% wider target for strong momentum
                } else if (momentum < 0.01) {
                  weightedMove *= 0.9; // 10% tighter target for weak momentum
                }
              }

              if (potentialMove > baseMove * 1.1) {
                weightedMove = baseMove * 0.6 + potentialMove * 0.4;
              }
            }

            return acc + weightedMove * (isRecent ? 1.5 : 1);
          }, 0) /
          (winningTrades.length + recentWinningTrades.length * 0.5)
        ).toFixed(2)
      : null;

    // Handle losing trades with enhanced analysis
    const losingTrades = closedTrades.filter((t) => t.profitLoss.realized < 0);
    const recentLosingTrades = recentTrades.filter(
      (t) => t.profitLoss.realized < 0
    );

    const suggestedStop = losingTrades.length
      ? (
          losingTrades.reduce((acc, trade) => {
            const actualLoss = Math.abs(trade.exitPrice - trade.entryPrice);
            const isRecent = recentLosingTrades.some(
              (t) => t._id === trade._id
            );
            let adjustedStop = actualLoss;

            if (trade.postExitHigh !== null && trade.postExitLow !== null) {
              const { volatility, momentum } = getTradeMetrics(trade);
              const priceRecovery =
                trade.type === "LONG"
                  ? trade.postExitHigh - trade.postExitLow
                  : trade.postExitHigh - trade.postExitLow;

              // Momentum-based stop adjustment
              if (momentum) {
                if (momentum > 0.02) {
                  adjustedStop *= 1.15; // 15% wider stops for high momentum
                } else if (momentum < 0.01) {
                  adjustedStop *= 0.85; // 15% tighter stops for low momentum
                }
              }

              if (priceRecovery > actualLoss * 0.5) {
                adjustedStop *= 0.8;
              }

              // Never suggest a stop smaller than half the momentum
              if (momentum) {
                adjustedStop = Math.max(
                  adjustedStop,
                  trade.entryPrice * momentum * 0.5
                );
              }
            }

            return acc + adjustedStop * (isRecent ? 1.5 : 1);
          }, 0) /
          (losingTrades.length + recentLosingTrades.length * 0.5)
        ).toFixed(2)
      : null;

    return {
      suggestedStopLoss: suggestedStop,
      suggestedTarget,
      tradesAnalyzed: closedTrades.length,
    };
  }, [trades]);

  return (
    <div
      className="bg-white p-4 rounded shadow h-full"
      data-tour="exit-analysis"
    >
      <h3 className="text-sm text-black font-medium">Exit Analysis</h3>
      <div className="grid grid-cols-1 gap-4 mt-2">
        {!trades?.length ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">Add trades to see analysis</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-1">Suggested Stop Loss</p>
              <p className="text-lg font-bold text-red-600">
                {analysis?.suggestedStopLoss
                  ? `$${analysis.suggestedStopLoss}`
                  : "Insufficient data"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Suggested Profit Target
              </p>
              <p className="text-lg font-bold text-green-600">
                {analysis?.suggestedTarget
                  ? `$${analysis.suggestedTarget}`
                  : "Insufficient data"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StopLossStudy;
