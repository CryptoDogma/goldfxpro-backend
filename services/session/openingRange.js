/**
 * openingRange.js
 * Calculates Opening Range (ORB) for a session
 */

function getOpeningRange(candles, session, minutes = 15) {
  if (!candles || candles.length === 0) return null;

  // Filter candles belonging to the session
  const sessionCandles = candles.filter(c => c.session === session);

  if (!sessionCandles.length) return null;

  // Take first N minutes
  const orbCandles = sessionCandles.slice(0, minutes);

  if (orbCandles.length < minutes) return null;

  let high = -Infinity;
  let low = Infinity;

  for (const c of orbCandles) {
    if (c.high > high) high = c.high;
    if (c.low < low) low = c.low;
  }

  return {
    session,
    orbHigh: high,
    orbLow: low,
    range: high - low,
    minutes
  };
}

module.exports = { getOpeningRange };
