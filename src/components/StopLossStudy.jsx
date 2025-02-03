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

        // Enhanced trend analysis using both timing and sequence
        let trendStrength = 1;

        if (trade.postExitAnalysis?.lowBeforeHigh !== null) {
          // Base adjustment from sequence
          if (trade.type === "LONG") {
            trendStrength = trade.postExitAnalysis.lowBeforeHigh ? 0.8 : 1.2;
          } else {
            trendStrength = trade.postExitAnalysis.lowBeforeHigh ? 1.2 : 0.8;
          }

          // Time-based adjustments if both times are available
          if (
            trade.postExitAnalysis.timeOfLow &&
            trade.postExitAnalysis.timeOfHigh
          ) {
            const lowTime = new Date(trade.postExitAnalysis.timeOfLow);
            const highTime = new Date(trade.postExitAnalysis.timeOfHigh);
            const timeDiffMinutes = Math.abs(highTime - lowTime) / (1000 * 60);

            // If times are very close (within 5 minutes), reduce the trend strength adjustment
            if (timeDiffMinutes <= 5) {
              trendStrength = (trendStrength + 1) / 2; // Move halfway back to neutral
            }
            // If there's a long delay (over 30 minutes), strengthen the trend signal
            else if (timeDiffMinutes > 30) {
              trendStrength =
                trendStrength > 1
                  ? trendStrength * 1.1 // Strengthen bullish signal
                  : trendStrength * 0.9; // Strengthen bearish signal
            }

            // Adjust for time of day - moves near market close (last hour) get less weight
            const marketClose = new Date(lowTime);
            marketClose.setHours(16, 0, 0); // Assuming 4 PM market close
            const minutesToClose = Math.min(
              (marketClose - lowTime) / (1000 * 60),
              (marketClose - highTime) / (1000 * 60)
            );

            if (minutesToClose <= 60) {
              trendStrength = (trendStrength + 1) / 2; // Reduce trend strength for end-of-day moves
            }
          }
        }

        return { volatility, momentum, trendStrength };
      }
      return { volatility: null, momentum: null, trendStrength: 1 };
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
              const { volatility, momentum, trendStrength } =
                getTradeMetrics(trade);
              const potentialMove =
                trade.type === "LONG"
                  ? trade.postExitHigh - trade.entryPrice
                  : trade.entryPrice - trade.postExitLow;

              // Apply trend strength to base move
              weightedMove *= trendStrength;

              // Momentum-based adjustment
              if (momentum) {
                if (momentum > 0.02) {
                  weightedMove *= 1.2;
                } else if (momentum < 0.01) {
                  weightedMove *= 0.9;
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
              const { volatility, momentum, trendStrength } =
                getTradeMetrics(trade);
              const priceRecovery =
                trade.type === "LONG"
                  ? trade.postExitHigh - trade.postExitLow
                  : trade.postExitHigh - trade.postExitLow;

              // Apply trend strength first
              adjustedStop *= trendStrength;

              if (momentum) {
                if (momentum > 0.02) {
                  adjustedStop *= 1.15;
                } else if (momentum < 0.01) {
                  adjustedStop *= 0.85;
                }
              }

              if (priceRecovery > actualLoss * 0.5) {
                adjustedStop *= 0.8;
              }

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
