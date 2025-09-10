const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // You can also use SMTP providers
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app-specific password if using Gmail
  },
});

async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Adventure Ecommerce" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending mail:", err);
  }
}

module.exports = sendMail;
