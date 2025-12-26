/**
 * sessionLevels.js
 * Opening Range (ORB) + Session levels for v4 / v5
 */

function getSessionLevels(candles, session, minutes = 15) {
  if (!candles || candles.length === 0) return null;

  // Candles must already have session assigned
  const sessionCandles = candles.filter(c => c.session === session);

  if (!sessionCandles.length) return null;

  // Opening Range candles (first X minutes)
  const orbCandles = sessionCandles.slice(0, minutes);

  if (orbCandles.length < minutes) return null;

  let orbHigh = -Infinity;
  let orbLow = Infinity;

  for (const c of orbCandles) {
    if (c.high > orbHigh) orbHigh = c.high;
    if (c.low < orbLow) orbLow = c.low;
  }

  return {
    session,
    orbHigh,
    orbLow,
    range: orbHigh - orbLow,
    firstCandle: orbCandles[0]
  };
}

module.exports = { getSessionLevels };
