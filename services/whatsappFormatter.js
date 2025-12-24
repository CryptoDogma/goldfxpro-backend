/**
 * whatsappFormatter.js
 * Builds clean WhatsApp trade messages
 */

function buildTradeMessage(signal) {
  return `
📊 *GOLD FX PRO – TRADE SIGNAL*

*Strategy:* ${signal.strategy.toUpperCase()}
*Pair:* ${signal.pair}
*Timeframe:* ${signal.timeframe}

*Direction:* ${signal.direction}
*Entry:* ${signal.entry}
*Stop Loss:* ${signal.stopLoss}
*Take Profit:* ${signal.takeProfit}

*Session:* ${signal.session}
*Confidence:* ${Math.round(signal.confidence * 100)}%

_${signal.reasoning}_
`.trim();
}

module.exports = { buildTradeMessage };
