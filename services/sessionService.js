/**
 * sessionService.js
 * Determines active trading session and volatility
 * Uses UTC time (industry standard)
 */

function getSessionInfo() {
  const hour = new Date().getUTCHours();

  // London: 07:00–16:00 UTC
  if (hour >= 7 && hour < 16) {
    return {
      session: "London",
      volatility: "High"
    };
  }

  // New York: 13:00–20:00 UTC
  if (hour >= 13 && hour < 20) {
    return {
      session: "New York",
      volatility: "High"
    };
  }

  // Asia / Off-hours
  return {
    session: "Asia / Off-hours",
    volatility: "Low"
  };
}

module.exports = {
  getSessionInfo
};
