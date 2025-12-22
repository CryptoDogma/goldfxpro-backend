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
async function sendVerificationEmail(to, token) {
  const link = `${process.env.BASE_URL}/api/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"GOLD FX PRO" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your GOLD FX PRO account",
    html: `
      <h2>Verify Your Email</h2>
      <p>Please confirm your email address to activate your account.</p>
      <a href="${link}">Verify Email</a>
      <p>This link can only be used once.</p>
    `
  });
}

async function sendLicenseEmail(to, license) {
  await transporter.sendMail({
    from: `"GOLD FX PRO" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your GOLD FX PRO License Key",
    html: `
      <h2>Your License Key</h2>
      <p>Please keep this key safe:</p>
      <h3>${license}</h3>
      <p>You will need this to log in.</p>
    `
  });
}

module.exports = {
  sendActivationEmail,
  sendVerificationEmail,
  sendLicenseEmail
};
