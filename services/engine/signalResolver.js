/**
 * signalResolver.js
 * Chooses the best signal from multiple strategy results
 */

const STRATEGY_PRIORITY = ["v4", "v3", "v2", "v1"];

function getPriority(strategy) {
  const index = STRATEGY_PRIORITY.indexOf(strategy);
  return index === -1 ? 999 : index;
}

module.exports.resolveBestSignal = function resolveBestSignal(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  // Only consider TRADE signals
  const trades = results.filter(r => r.status === "TRADE");

  if (trades.length === 0) {
    return null;
  }

  // Sort by:
  // 1️⃣ Strategy priority
  // 2️⃣ Confidence (desc)
  trades.sort((a, b) => {
    const pA = getPriority(a.strategy);
    const pB = getPriority(b.strategy);

    if (pA !== pB) return pA - pB;

    return (b.confidence || 0) - (a.confidence || 0);
  });

  return trades[0];
};
