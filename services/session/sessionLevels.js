/**
 * sessionLevels.js
 * Extract first 15m candle of the session
 */

function getSessionLevels(candles, session) {
  if (!candles || candles.length === 0) return null;

  // Map session → UTC hours (adjust if needed)
  const SESSION_HOURS = {
    Asia: [0, 3],
    London: [7, 10],
    "New York": [13, 16]
  };

  const hours = SESSION_HOURS[session];
  if (!hours) return null;

  const [startHour, endHour] = hours;

  const sessionCandles = candles.filter(c => {
    const date = new Date(c.time);
    const hour = date.getUTCHours();
    return hour >= startHour && hour < endHour;
  });

  if (!sessionCandles.length) return null;

  const firstCandle = sessionCandles[0];

  return {
    firstCandle,
    sessionHigh: firstCandle.high,
    sessionLow: firstCandle.low
  };
}

module.exports = { getSessionLevels };
