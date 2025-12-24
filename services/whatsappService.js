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
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM, // whatsapp:+14155238886
    to: `whatsapp:${to}`,                   // whatsapp:+2781...
    body: message
  });
}

module.exports = { sendWhatsApp };
