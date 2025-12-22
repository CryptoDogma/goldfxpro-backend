const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendActivationEmail(to, code) {
  const mailOptions = {
    from: `"GOLD FX PRO" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your GOLD FX PRO Activation Key",
    html: `
      <h2>Welcome to GOLD FX PRO</h2>
      <p>Your activation key is:</p>
      <h3 style="letter-spacing:2px;">${code}</h3>
      <p>Use this key during registration to activate your account.</p>
      <br/>
      <p>Happy trading,<br/><strong>GOLD FX PRO Team</strong></p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendActivationEmail
};
