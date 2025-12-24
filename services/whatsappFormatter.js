/**
 * whatsappFormatter.js
 * Formats WhatsApp trade messages by strategy
 */

const DISCLAIMER = `
📎 Disclaimer:
This message contains a trading plan provided by GOLD FX PRO.
All trading involves risk. Past performance does not guarantee future results.
You are responsible for your own trade execution and risk management.
GOLD FX PRO is not liable for any losses incurred.
`.trim();

function buildTradeMessage(signal) {
  if (signal.strategy === "v4") {
    return `${buildV4Message(signal)}\n\n${DISCLAIMER}`;
  }

  // fallback (v1–v3)
  return `${buildDefaultMessage(signal)}\n\n${DISCLAIMER}`;
}

function buildV4Message(signal) {
  return `
🟡 GOLD FX PRO — TRADE SIGNAL

📊 Market: ${signal.pair}
⏱ Timeframe: ${signal.timeframe}
📌 Strategy: v4 — Session Fake-out

${signal.direction === "BUY" ? "🟢 BUY" : "🔴 SELL"}
Entry: ${signal.entry}
Stop Loss: ${signal.stopLoss}
Take Profit: ${signal.takeProfit}

🧠 Reason:
${signal.reasoning}

🎯 Target:
50% mean reversion of session range

⚠️ Notes:
• Valid during ${signal.session}
• Invalidation beyond session extreme
• Trade only with proper risk

— GOLD FX PRO
`.trim();
}

function buildDefaultMessage(signal) {
  return `
📊 ${signal.pair} (${signal.timeframe})
${signal.direction}

Entry: ${signal.entry}
SL: ${signal.stopLoss}
TP: ${signal.takeProfit}

Confidence: ${Math.round(signal.confidence * 100)}%
Strategy: ${signal.strategy.toUpperCase()}
`.trim();
}

module.exports = { buildTradeMessage };
