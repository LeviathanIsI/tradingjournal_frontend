import React, { useMemo, useState, useEffect } from "react";

const StopLossStudy = ({ trades, user, stats }) => {
  const [planEntry, setPlanEntry] = useState("");
  const [planShares, setPlanShares] = useState("");
  const [riskPercentage, setRiskPercentage] = useState("1");
  const [plannedRisk, setPlannedRisk] = useState(null);
  const [plannedReward, setPlannedReward] = useState(null);

  const accountBalance =
    (user?.preferences?.startingCapital || 0) + (stats?.totalProfit || 0);

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
      if (trade.postExitHigh && trade.postExitLow && trade.exitDate) {
        const volatility =
          (trade.postExitHigh - trade.postExitLow) / trade.entryPrice;
        const totalMove =
          trade.type === "LONG"
            ? trade.postExitHigh - trade.postExitLow
            : trade.postExitLow - trade.postExitHigh;
        const momentum = Math.abs(totalMove / trade.entryPrice);

        let trendStrength = 1;
        let timingQuality = 1;

        if (
          trade.postExitAnalysis?.timeOfLow &&
          trade.postExitAnalysis?.timeOfHigh
        ) {
          const exitTime = new Date(trade.exitDate);
          const lowTime = new Date(trade.postExitAnalysis.timeOfLow);
          const highTime = new Date(trade.postExitAnalysis.timeOfHigh);

          // Calculate minutes from exit to high and low
          const minsToHigh = Math.abs(highTime - exitTime) / (1000 * 60);
          const minsToLow = Math.abs(lowTime - exitTime) / (1000 * 60);

          // For long trades:
          if (trade.type === "LONG") {
            // High close to exit = stronger signal
            if (minsToHigh <= 15) {
              timingQuality *= 1.3; // Strong momentum continuation
            } else if (minsToHigh <= 30) {
              timingQuality *= 1.1; // Moderate momentum
            }

            // Low far from exit = more resilient
            if (minsToLow >= 90) {
              trendStrength *= 1.2; // Very resilient
            } else if (minsToLow <= 15) {
              trendStrength *= 0.7; // Quick reversal, be careful
            }
          }
          // For short trades (inverse logic):
          else {
            // Low close to exit = stronger signal
            if (minsToLow <= 15) {
              timingQuality *= 1.3;
            } else if (minsToLow <= 30) {
              timingQuality *= 1.1;
            }

            // High far from exit = more resilient
            if (minsToHigh >= 90) {
              trendStrength *= 1.2;
            } else if (minsToHigh <= 15) {
              trendStrength *= 0.7;
            }
          }

          // Time of day adjustments
          const marketClose = new Date(exitTime);
          marketClose.setHours(16, 0, 0);
          const minsToClose = (marketClose - exitTime) / (1000 * 60);

          // End of day moves get reduced weight
          if (minsToClose <= 30) {
            timingQuality *= 0.8;
            trendStrength *= 0.8;
          }
        }

        return {
          volatility,
          momentum,
          trendStrength,
          timingQuality,
        };
      }
      return {
        volatility: null,
        momentum: null,
        trendStrength: 1,
        timingQuality: 1,
      };
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
              const { volatility, momentum, trendStrength, timingQuality } =
                getTradeMetrics(trade);
              weightedMove *= trendStrength * timingQuality;
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
              const { volatility, momentum, trendStrength, timingQuality } =
                getTradeMetrics(trade);
              adjustedStop *= trendStrength / timingQuality;
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

    let finalStopLoss = suggestedStop;
    let finalTarget = suggestedTarget;

    if (suggestedStop && suggestedTarget) {
      // If the stop is still too large, scale both down
      if (Number(finalStopLoss) >= Number(finalTarget)) {
        finalStopLoss = (Number(finalTarget) / 1.5).toFixed(2);
      }
    }

    if (Number(finalStopLoss) > Number(finalTarget) * 0.4) {
      finalStopLoss = (Number(finalTarget) * 0.4).toFixed(2);
    }

    // Add timing-based target extensions
    const tradesWithTimings = closedTrades.filter(
      (t) => t.postExitAnalysis?.timeOfHigh && t.postExitAnalysis?.timeOfLow
    );

    let suggestedHold = null;
    let holdContext = null;
    let avgTimeToHigh = null;

    // Calculate intraday timing factors
    const marketOpen = 9.5; // 9:30 AM
    const marketClose = 16; // 4:00 PM

    const getTimeOfDay = (date) => {
      const hours = date.getHours() + date.getMinutes() / 60;
      return hours;
    };

    const timingAnalysis = tradesWithTimings.reduce(
      (acc, trade) => {
        const exitTime = new Date(trade.exitDate);
        const highTime = new Date(trade.postExitAnalysis.timeOfHigh);
        const lowTime = new Date(trade.postExitAnalysis.timeOfLow);

        const timeToOptimal =
          trade.type === "LONG"
            ? (highTime - exitTime) / (1000 * 60)
            : (lowTime - exitTime) / (1000 * 60);

        const timeOfExit = getTimeOfDay(exitTime);
        const isNearClose = timeOfExit >= 15.5; // After 3:30 PM
        const isNearOpen = timeOfExit <= 10; // Before 10:00 AM

        const priceImprovement =
          trade.type === "LONG"
            ? ((trade.postExitHigh - trade.exitPrice) / trade.exitPrice) * 100
            : ((trade.exitPrice - trade.postExitLow) / trade.exitPrice) * 100;

        // Enhanced timing classification
        const quickMove = timeToOptimal <= 5;
        const moderateMove = timeToOptimal <= 15;
        const slowMove = timeToOptimal <= 30;

        return {
          ...acc,
          totalTimeToOptimal: acc.totalTimeToOptimal + timeToOptimal,
          quickMoves: acc.quickMoves + (quickMove ? 1 : 0),
          moderateMoves: acc.moderateMoves + (moderateMove ? 1 : 0),
          slowMoves: acc.slowMoves + (slowMove ? 1 : 0),
          morningTrades: acc.morningTrades + (isNearOpen ? 1 : 0),
          endDayTrades: acc.endDayTrades + (isNearClose ? 1 : 0),
          totalImprovement: acc.totalImprovement + priceImprovement,
          favorableTimingCount:
            acc.favorableTimingCount +
            (trade.postExitAnalysis.lowBeforeHigh === (trade.type === "SHORT")
              ? 1
              : 0),
          count: acc.count + 1,
        };
      },
      {
        totalTimeToOptimal: 0,
        quickMoves: 0,
        moderateMoves: 0,
        slowMoves: 0,
        morningTrades: 0,
        endDayTrades: 0,
        totalImprovement: 0,
        favorableTimingCount: 0,
        count: 0,
      }
    );

    const avgTimeToOptimal =
      timingAnalysis.totalTimeToOptimal / timingAnalysis.count;
    const quickMoveRate = timingAnalysis.quickMoves / timingAnalysis.count;
    const moderateMoveRate =
      timingAnalysis.moderateMoves / timingAnalysis.count;
    const favorableTimingRate =
      timingAnalysis.favorableTimingCount / timingAnalysis.count;
    const avgImprovement =
      timingAnalysis.totalImprovement / timingAnalysis.count;
    const morningRate = timingAnalysis.morningTrades / timingAnalysis.count;
    const endDayRate = timingAnalysis.endDayTrades / timingAnalysis.count;

    // More granular hold time suggestions
    if (quickMoveRate > 0.6) {
      suggestedHold = "3-8 minutes";
      holdContext = "Very quick moves, tight exits recommended";
    } else if (avgTimeToOptimal <= 10 && favorableTimingRate > 0.7) {
      suggestedHold = "5-12 minutes";
      holdContext = "Fast directional moves, quick targets";
    } else if (avgTimeToOptimal <= 15 && favorableTimingRate > 0.6) {
      suggestedHold = "10-15 minutes";
      holdContext = "Strong momentum, allow small pullbacks";
    } else if (avgTimeToOptimal <= 20 && favorableTimingRate > 0.5) {
      suggestedHold = "15-25 minutes";
      holdContext = "Moderate momentum, be patient";
    } else if (avgTimeToOptimal <= 30) {
      suggestedHold = "20-35 minutes";
      holdContext = `Slower moves, avg gain ${avgImprovement.toFixed(1)}%`;
    } else {
      suggestedHold = "30-60 minutes";
      holdContext = `Trending move, ${
        favorableTimingRate > 0.5 ? "steady trend" : "watch for reversals"
      }`;
    }

    // Time of day adjustments
    if (morningRate > 0.5) {
      holdContext += ", morning moves tend to be faster";
      suggestedHold =
        suggestedHold
          .split("-")
          .map((t) => Math.max(3, Number(t) * 0.8))
          .join("-") + " minutes";
    }

    if (endDayRate > 0.4) {
      holdContext += ", careful near market close";
      suggestedHold =
        suggestedHold
          .split("-")
          .map((t) => Math.max(3, Number(t) * 0.7))
          .join("-") + " minutes";
    }

    // More nuanced target adjustments
    let targetMultiplier = 1.0;

    if (quickMoveRate > 0.6 && favorableTimingRate > 0.7) {
      targetMultiplier *= 1.1; // Quick and accurate moves
    } else if (favorableTimingRate < 0.4) {
      targetMultiplier *= 0.85; // Poor timing accuracy
    }

    if (avgImprovement > 40 && favorableTimingRate > 0.6) {
      targetMultiplier *= 1.15; // Good follow-through
    }

    if (endDayRate > 0.4) {
      targetMultiplier *= 0.9; // More conservative near close
    }

    finalTarget = (Number(finalTarget) * targetMultiplier).toFixed(2);

    return {
      suggestedStopLoss: finalStopLoss,
      suggestedTarget: finalTarget,
      tradesAnalyzed: closedTrades.length,
      baseTarget: suggestedTarget,
      suggestedHoldTime: suggestedHold,
      holdTimeContext: holdContext,
    };
  }, [trades]);

  useEffect(() => {
    if (planEntry && analysis?.suggestedStopLoss && analysis?.suggestedTarget) {
      const entry = Number(planEntry);
      const stopPrice = Number(analysis.suggestedStopLoss);
      const targetPrice = Number(analysis.suggestedTarget);

      // Calculate per-share values
      const riskPerShare = Math.abs(entry - stopPrice);
      const rewardPerShare = Math.abs(targetPrice - entry);

      // Always calculate suggested shares when we have risk percentage
      if (riskPercentage) {
        const maxRiskAmount = accountBalance * (Number(riskPercentage) / 100);
        const calculatedShares = Math.floor(maxRiskAmount / riskPerShare);

        // Always update shares when risk percentage changes
        setPlanShares(calculatedShares.toString());

        // Calculate risk/reward based on calculated shares
        const actualRisk = (calculatedShares * riskPerShare).toFixed(2);
        const actualReward = (calculatedShares * rewardPerShare).toFixed(2);

        setPlannedRisk(actualRisk);
        setPlannedReward(actualReward);
      }
    } else {
      setPlannedRisk(null);
      setPlannedReward(null);
    }
  }, [planEntry, analysis, riskPercentage, accountBalance]);

  useEffect(() => {
    if (
      planShares &&
      planEntry &&
      analysis?.suggestedStopLoss &&
      analysis?.suggestedTarget
    ) {
      const entry = Number(planEntry);
      const stopPrice = Number(analysis.suggestedStopLoss);
      const targetPrice = Number(analysis.suggestedTarget);

      const riskPerShare = Math.abs(entry - stopPrice);
      const rewardPerShare = Math.abs(targetPrice - entry);

      const shares = Number(planShares);
      const actualRisk = (shares * riskPerShare).toFixed(2);
      const actualReward = (shares * rewardPerShare).toFixed(2);

      setPlannedRisk(actualRisk);
      setPlannedReward(actualReward);
    }
  }, [planShares]);

  return (
    <div
      className="bg-white p-4 rounded shadow h-full"
      data-tour="exit-analysis"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Left Side - Exit Analysis */}
        <div>
          <h3 className="text-sm text-black font-medium">Exit Analysis</h3>
          <div className="grid grid-cols-1 gap-4 mt-2">
            {!trades?.length ? (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">
                  Add trades to see analysis
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Suggested Stop Loss
                  </p>
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
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Suggested Hold Time
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {analysis?.suggestedHoldTime || "Insufficient data"}
                  </p>
                  {analysis?.holdTimeContext && (
                    <p className="text-xs text-gray-500 mt-1">
                      {analysis.holdTimeContext}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Plan Your Trade */}
        <div>
          <h4 className="text-sm font-medium mb-3">Plan Your Trade</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                value={planEntry}
                onChange={(e) => setPlanEntry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Risk Percentage
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={riskPercentage}
                  onChange={(e) => setRiskPercentage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  step="0.1"
                  min="0.1"
                  max="100"
                />
                <span className="ml-1">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ${((Number(riskPercentage) / 100) * accountBalance).toFixed(2)}{" "}
                of ${accountBalance.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Suggested Shares
              </label>
              <input
                type="number"
                value={planShares}
                onChange={(e) => setPlanShares(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                min="1"
                placeholder={
                  planEntry
                    ? Math.floor(
                        ((Number(riskPercentage) / 100) * accountBalance) /
                          Math.abs(
                            Number(planEntry) -
                              Number(analysis?.suggestedStopLoss || 0)
                          )
                      )
                    : ""
                }
              />
            </div>

            {plannedRisk && plannedReward && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Potential Risk</p>
                  <p className="text-md font-semibold text-red-600">
                    ${plannedRisk}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Potential Reward</p>
                  <p className="text-md font-semibold text-green-600">
                    ${plannedReward}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">
                    Risk/Reward Ratio: 1:
                    {(plannedReward / plannedRisk).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopLossStudy;
