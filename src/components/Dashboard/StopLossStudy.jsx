import React, { useMemo, useState, useEffect } from "react";

const StopLossStudy = ({ trades, user, stats, experienceLevel }) => {
  const [planEntry, setPlanEntry] = useState("");
  const [planShares, setPlanShares] = useState("");
  const [plannedRisk, setPlannedRisk] = useState(null);
  const [plannedReward, setPlannedReward] = useState(null);
  const [supportPrice, setSupportPrice] = useState("");
  const [resistancePrice, setResistancePrice] = useState("");
  const [useSupRes, setUseSupRes] = useState(false);
  const [calculatedStop, setCalculatedStop] = useState(null);
  const [calculatedTarget, setCalculatedTarget] = useState(null);

  const RISK_PERCENTAGE = 10;
  const STOP_LOSS_PERCENTAGE = 5;
  const REWARD_MULTIPLIER = 3;
  const SUPPORT_BUFFER = 0.02; // 2% buffer below support
  const RESISTANCE_BUFFER = 0.02; // 2% buffer below resistance

  const getExperienceFactors = () => {
    // Initialize result object with common properties
    let result = {
      stopLossMultiplier: 1.2, // Default to beginner values
      targetMultiplier: 0.8,
      holdTimeAdjustment: 0.8,
      displayLevel: "Unknown",
      explanation: "Calculating experience level...",
    };

    // If user has explicitly set their experience level and it's not auto
    if (
      user?.preferences?.experienceLevel &&
      user.preferences.experienceLevel !== "auto"
    ) {
      const effectiveExperience = user.preferences.experienceLevel;
      return {
        ...result,
        stopLossMultiplier:
          effectiveExperience === "beginner"
            ? 1.2
            : effectiveExperience === "intermediate"
            ? 1.0
            : 0.8,
        targetMultiplier:
          effectiveExperience === "beginner"
            ? 0.8
            : effectiveExperience === "intermediate"
            ? 1.0
            : 1.2,
        holdTimeAdjustment:
          effectiveExperience === "beginner"
            ? 0.8
            : effectiveExperience === "intermediate"
            ? 1.0
            : 1.2,
        displayLevel:
          effectiveExperience.charAt(0).toUpperCase() +
          effectiveExperience.slice(1), // Capitalize first letter
        explanation: `Manually set to ${effectiveExperience}`,
      };
    }

    // For auto mode, calculate based on trade history
    const recentTrades =
      trades?.filter((trade) => {
        const tradeDate = new Date(trade.exitDate);
        const daysDiff = (new Date() - tradeDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 90;
      }) || [];

    // If in auto mode but not enough trades
    if (recentTrades.length < 10) {
      return {
        ...result,
        displayLevel: "Auto Mode",
        explanation: `Need at least 10 trades to calculate (currently have ${recentTrades.length})`,
      };
    }

    // Calculate metrics from recent trades
    const winRate =
      recentTrades.filter((t) => t.profitLoss.realized > 0).length /
      recentTrades.length;
    const avgProfit =
      recentTrades.reduce((acc, t) => acc + t.profitLoss.realized, 0) /
      recentTrades.length;
    const consistencyScore =
      recentTrades
        .map((t) => t.profitLoss.realized)
        .reduce((acc, curr, _, arr) => {
          const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
          return acc + Math.pow(curr - mean, 2);
        }, 0) / recentTrades.length;

    // Determine experience level based on multiple factors
    let inferredExperience;
    if (winRate >= 0.6 && avgProfit > 0 && consistencyScore < 100) {
      inferredExperience = "advanced";
    } else if (winRate >= 0.45 && avgProfit > 0) {
      inferredExperience = "intermediate";
    } else {
      inferredExperience = "beginner";
    }

    return {
      stopLossMultiplier:
        inferredExperience === "beginner"
          ? 1.2
          : inferredExperience === "intermediate"
          ? 1.0
          : 0.8,
      targetMultiplier:
        inferredExperience === "beginner"
          ? 0.8
          : inferredExperience === "intermediate"
          ? 1.0
          : 1.2,
      holdTimeAdjustment:
        inferredExperience === "beginner"
          ? 0.8
          : inferredExperience === "intermediate"
          ? 1.0
          : 1.2,
      displayLevel: `Auto Mode (${
        inferredExperience.charAt(0).toUpperCase() + inferredExperience.slice(1)
      })`,
      explanation: `Calculated from ${
        recentTrades.length
      } trades in last 90 days (Win Rate: ${(winRate * 100).toFixed(1)}%)`,
    };
  };

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

        const missedOpportunities = tradesWithTimings.reduce(
          (acc, trade) => {
            const exitPrice = trade.exitPrice;
            const optimalPrice =
              trade.type === "LONG" ? trade.postExitHigh : trade.postExitLow;
            const missedAmount = Math.abs(optimalPrice - exitPrice);
            const missedPercent = (missedAmount / exitPrice) * 100;

            return {
              count: acc.count + (missedPercent > 2 ? 1 : 0),
              totalMissed: acc.totalMissed + missedAmount,
              instances: [
                ...acc.instances,
                {
                  symbol: trade.symbol,
                  missed: missedAmount,
                  percent: missedPercent,
                },
              ]
                .sort((a, b) => b.missed - a.missed)
                .slice(0, 3),
            };
          },
          { count: 0, totalMissed: 0, instances: [] }
        );

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
      holdContext = `Based on your last ${
        timingAnalysis.count
      } trades, you're seeing quick price movements within 3-8 minutes. ${
        missedOpportunities.count > 0
          ? `You've missed potential gains of $${missedOpportunities.totalMissed.toFixed(
              2
            )} by exiting too early in ${missedOpportunities.count} trades.`
          : "Your exit timing has been effective."
      }`;
    } else if (avgTimeToOptimal <= 15) {
      holdContext = `Your trades typically reach optimal prices within 15 minutes. Notable examples include ${missedOpportunities.instances
        .map((i) => `${i.symbol} (${i.percent.toFixed(1)}% potential)`)
        .join(
          ", "
        )}. Consider giving trades more room to develop while maintaining your stop loss discipline.`;
    }

    if (quickMoveRate > 0.6) {
      suggestedHold = "3-8";
    } else if (avgTimeToOptimal <= 10 && favorableTimingRate > 0.7) {
      suggestedHold = "5-12";
    } else if (avgTimeToOptimal <= 15 && favorableTimingRate > 0.6) {
      suggestedHold = "10-15";
    } else if (avgTimeToOptimal <= 20 && favorableTimingRate > 0.5) {
      suggestedHold = "15-25";
    } else if (avgTimeToOptimal <= 30) {
      suggestedHold = "20-35";
    } else {
      suggestedHold = "30-60";
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

    const expFactors = getExperienceFactors();
    finalStopLoss = (
      Number(finalStopLoss) * expFactors.stopLossMultiplier
    ).toFixed(2);
    finalTarget = (Number(finalTarget) * expFactors.targetMultiplier).toFixed(
      2
    );
    suggestedHold =
      suggestedHold
        .split("-")
        .map((t) => (Number(t) * expFactors.holdTimeAdjustment).toFixed(0))
        .join("-") + " minutes";

    return {
      suggestedStopLoss: finalStopLoss,
      suggestedTarget: finalTarget,
      tradesAnalyzed: closedTrades.length,
      baseTarget: suggestedTarget,
      suggestedHoldTime: suggestedHold,
      holdTimeContext: holdContext,
      experienceLevel: expFactors.displayLevel,
      experienceContext: expFactors.explanation,
    };
  }, [trades]);

  useEffect(() => {
    if (planEntry) {
      const entry = Number(planEntry);
      let stopPrice, targetPrice;

      if (useSupRes && supportPrice && resistancePrice) {
        const support = Number(supportPrice);
        const resistance = Number(resistancePrice);

        // Stop loss should be 2% below support
        stopPrice = support * (1 - SUPPORT_BUFFER);

        // Target price should be 2% below resistance
        targetPrice = resistance * (1 - RESISTANCE_BUFFER);
      } else {
        // Default calculation without support/resistance
        stopPrice = entry * (1 - STOP_LOSS_PERCENTAGE / 100);
        const riskAmount = entry - stopPrice;
        targetPrice = entry + riskAmount * REWARD_MULTIPLIER;
      }

      // Ensure valid calculations
      stopPrice = stopPrice.toFixed(2);
      targetPrice = targetPrice.toFixed(2);

      // Set the calculated values for display
      setCalculatedStop(stopPrice);
      setCalculatedTarget(targetPrice);

      // Calculate per-share values
      const riskPerShare = Number(Math.abs(entry - stopPrice).toFixed(2));
      const rewardPerShare = Number(Math.abs(targetPrice - entry).toFixed(2));

      // Calculate position size
      const maxPositionValue = accountBalance * (RISK_PERCENTAGE / 100);
      const calculatedShares = Math.floor(maxPositionValue / entry);

      setPlanShares(calculatedShares.toString());
      setPlannedRisk((calculatedShares * riskPerShare).toFixed(2));
      setPlannedReward((calculatedShares * rewardPerShare).toFixed(2));
    } else {
      setPlannedRisk(null);
      setPlannedReward(null);
      setPlanShares("");
      setCalculatedStop(null);
      setCalculatedTarget(null);
    }
  }, [planEntry, accountBalance, supportPrice, resistancePrice, useSupRes]);

  return (
    <div className="bg-white dark:bg-gray-700/60 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side - Exit Analysis */}
        <div>
          <h3 className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">
            Exit Analysis
          </h3>
          <div className="bg-gray-100 dark:bg-gray-600/30 p-3 rounded-sm border border-gray-200 dark:border-gray-600/50 mb-4">
            <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              Analysis of your trading patterns:
            </p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li>• Based on your last 90 days of trades</li>
              <li>• Analyzes winning and losing patterns</li>
              <li>• Considers time of day and momentum</li>
            </ul>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">
              Note: Suggestions improve in accuracy as you add more trades to
              your history
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-2">
            {!trades?.length ? (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Add trades to see analysis
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Suggested Stop Loss
                  </p>
                  <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                    {analysis?.suggestedStopLoss
                      ? `$${analysis.suggestedStopLoss}`
                      : "Insufficient data"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Recommended stop loss based on historical price reversals
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Suggested Profit Target
                  </p>
                  <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                    {analysis?.suggestedTarget
                      ? `$${analysis.suggestedTarget}`
                      : "Insufficient data"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target price based on your winning trades' profit patterns
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Suggested Hold Time
                  </p>
                  <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                    {analysis?.suggestedHoldTime || "Insufficient data"}
                  </p>
                  {analysis?.holdTimeContext && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {analysis.holdTimeContext}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Experience Level
                  </p>
                  <p className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
                    {analysis?.experienceLevel || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {analysis?.experienceContext || ""}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Plan Your Trade */}
        <div>
          <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
            Plan Your Trade
          </h4>
          <div className="bg-gray-100 dark:bg-gray-600/30 p-3 rounded-sm border border-gray-200 dark:border-gray-600/50 mb-4">
            <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 mb-2">
              Risk Management Rules:
            </p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li>
                • Maximum position: 10% of account ($
                {(accountBalance * (RISK_PERCENTAGE / 100)).toFixed(2)})
              </li>
              <li>
                {useSupRes
                  ? "• Stop loss: 2% below support level"
                  : "• Stop loss: Fixed 5% below entry price"}
              </li>
              <li>
                {useSupRes
                  ? "• Target: 2% below resistance level"
                  : "• Target: 3x distance to stop (1:3 ratio)"}
              </li>
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                value={planEntry}
                onChange={(e) => setPlanEntry(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 
          bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 rounded-sm"
                step="0.01"
                min="0"
              />
            </div>

            <div className="flex items-center space-x-2 my-2">
              <input
                type="checkbox"
                id="useSupRes"
                checked={useSupRes}
                onChange={(e) => setUseSupRes(e.target.checked)}
                className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
          text-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <label
                htmlFor="useSupRes"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Use Support/Resistance Levels
              </label>
            </div>

            {useSupRes && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Support Price
                  </label>
                  <input
                    type="number"
                    value={supportPrice}
                    onChange={(e) => setSupportPrice(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 
              bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 rounded-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Resistance Price
                  </label>
                  <input
                    type="number"
                    value={resistancePrice}
                    onChange={(e) => setResistancePrice(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 
              bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 rounded-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            )}

            {planEntry && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Stop Loss Price
                  </label>
                  <p className="text-sm sm:text-base font-medium text-red-600 dark:text-red-400">
                    ${calculatedStop}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {useSupRes
                      ? "Based on support/resistance"
                      : "5% below entry price"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Target Price
                  </label>
                  <p className="text-sm sm:text-base font-medium text-green-600 dark:text-green-400">
                    ${calculatedTarget}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {useSupRes
                      ? "Based on support/resistance"
                      : "3x the distance to stop loss"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Position Size
                  </label>
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                    {planShares} shares
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total position value: $
                    {(Number(planShares) * Number(planEntry)).toFixed(2)}
                  </p>
                </div>

                {plannedRisk && plannedReward && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Potential Risk
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-red-600 dark:text-red-400">
                        ${plannedRisk}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Potential Reward
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">
                        ${plannedReward}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopLossStudy;
