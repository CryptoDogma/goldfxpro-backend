/**
 * whatsappService.js
 * Twilio WhatsApp integration
 */

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_FROM;

/**
 * Send WhatsApp message
 */
async function sendWhatsApp(to, message) {
  if (!FROM) {
    console.warn("WhatsApp FROM number not configured");
    return;
  }

  return client.messages.create({
    from: FROM,
    to: `whatsapp:${to}`,
    body: message
  });
}

module.exports = { sendWhatsApp };
