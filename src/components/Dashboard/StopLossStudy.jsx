import React, { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Percent,
  Target,
  Clock,
  BarChart,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

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
    <div className="bg-white/90 dark:bg-gray-800/60 p-5 sm:p-6 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm backdrop-blur-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Exit Analysis */}
        <div>
          <h3 className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            <div className="h-5 w-1 bg-primary rounded-full mr-2"></div>
            Exit Analysis
          </h3>
          <div className="bg-gradient-to-br from-gray-50/90 to-gray-100/80 dark:from-gray-700/30 dark:to-gray-600/20 p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm mb-5">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Analysis of your trading patterns:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-1.5"></div>
                    <span>Based on your last 90 days of trades</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-1.5"></div>
                    <span>Analyzes winning and losing patterns</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-1.5"></div>
                    <span>Considers time of day and momentum</span>
                  </li>
                </ul>
                <p className="text-xs italic text-gray-600 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600/20">
                  Note: Suggestions improve in accuracy as you add more trades
                  to your history
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {!trades?.length ? (
              <div className="col-span-1 sm:col-span-2 bg-gray-50/50 dark:bg-gray-700/20 rounded-sm border border-dashed border-gray-300 dark:border-gray-600/50 p-6 text-center">
                <BarChart className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Add trades to see analysis
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Your trade history will help generate personalized
                  recommendations
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white/90 dark:bg-gray-800/40 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Suggested Stop Loss
                    </p>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {analysis?.suggestedStopLoss
                        ? `$${analysis.suggestedStopLoss}`
                        : "Insufficient data"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Recommended stop loss based on historical price reversals
                    </p>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-gray-800/40 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Suggested Profit Target
                    </p>
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {analysis?.suggestedTarget
                        ? `$${analysis.suggestedTarget}`
                        : "Insufficient data"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Target price based on your winning trades' profit patterns
                    </p>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-gray-800/40 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Suggested Hold Time
                    </p>
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-primary dark:text-primary">
                      {analysis?.suggestedHoldTime || "Insufficient data"}
                    </p>
                    {analysis?.holdTimeContext && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {analysis.holdTimeContext}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-gray-800/40 rounded-sm border border-gray-200 dark:border-gray-700/40 p-4 shadow-sm">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Experience Level
                    </p>
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-accent dark:text-accent">
                      {analysis?.experienceLevel || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {analysis?.experienceContext || ""}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Plan Your Trade */}
        <div>
          <h4 className="flex items-center text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            <div className="h-5 w-1 bg-secondary rounded-full mr-2"></div>
            Plan Your Trade
          </h4>
          <div className="bg-gradient-to-br from-gray-50/90 to-gray-100/80 dark:from-gray-700/30 dark:to-gray-600/20 p-4 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm mb-5">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Percent className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Risk Management Rules:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary/80 mt-1.5"></div>
                    <span>
                      Maximum position: 10% of account ($
                      {(accountBalance * (RISK_PERCENTAGE / 100)).toFixed(2)})
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary/80 mt-1.5"></div>
                    <span>
                      {useSupRes
                        ? "Stop loss: 2% below support level"
                        : "Stop loss: Fixed 5% below entry price"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary/80 mt-1.5"></div>
                    <span>
                      {useSupRes
                        ? "Target: 2% below resistance level"
                        : "Target: 3x distance to stop (1:3 ratio)"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entry Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  value={planEntry}
                  onChange={(e) => setPlanEntry(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600/70 
                  bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 round-sm
                  focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-1"
                  step="0.01"
                  min="0"
                  placeholder="Enter stock price"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 my-2">
              <input
                type="checkbox"
                id="useSupRes"
                checked={useSupRes}
                onChange={(e) => setUseSupRes(e.target.checked)}
                className="h-4 w-4 rounded-sm border-gray-300 dark:border-gray-600/70 
                text-secondary focus:ring-1 focus:ring-secondary"
              />
              <label
                htmlFor="useSupRes"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Use Support/Resistance Levels
              </label>
            </div>

            {useSupRes && (
              <div className="space-y-4 bg-gray-50/50 dark:bg-gray-700/20 p-4 rounded-sm border border-gray-200 dark:border-gray-700/40">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Support Price
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={supportPrice}
                      onChange={(e) => setSupportPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600/70 
                      bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 round-sm
                      focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-1"
                      step="0.01"
                      min="0"
                      placeholder="Support price"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resistance Price
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={resistancePrice}
                      onChange={(e) => setResistancePrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600/70 
                      bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100 round-sm
                      focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-1"
                      step="0.01"
                      min="0"
                      placeholder="Resistance price"
                    />
                  </div>
                </div>
              </div>
            )}

            {planEntry && (
              <div className="mt-5 space-y-5 bg-white/90 dark:bg-gray-800/40 p-4 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Stop Loss Price
                    </label>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center">
                      <span className="text-sm mr-1">$</span>
                      {calculatedStop}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {useSupRes
                        ? "Based on support/resistance"
                        : "5% below entry price"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Target Price
                    </label>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center">
                      <span className="text-sm mr-1">$</span>
                      {calculatedTarget}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {useSupRes
                        ? "Based on support/resistance"
                        : "3x the distance to stop loss"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700/40">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Position Size
                  </label>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {planShares}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      shares
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total position value: $
                    {(Number(planShares) * Number(planEntry)).toFixed(2)}
                  </p>
                </div>

                {plannedRisk && plannedReward && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700/40">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                        Potential Risk
                      </p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center">
                        <span className="text-xs mr-1">$</span>
                        {plannedRisk}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        Potential Reward
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center">
                        <span className="text-xs mr-1">$</span>
                        {plannedReward}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopLossStudy;
