const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  // Check if Gmail SMTP credentials are configured in environment
  if (!user || !pass || user.trim() === '' || pass.trim() === '') {
    console.log(
      `[ShopNest Email] SMTP credentials not configured (GMAIL_USER/GMAIL_PASS). ` +
      `Simulated delivery to ${email} | Subject: "${subject}"`
    );
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });

    const mailOptions = {
      from: `"ShopNest Support" <${user.trim()}>`,
      to: email,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[ShopNest Email] Successfully dispatched email to ${email}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.warn(`[ShopNest Email] Warning: Could not deliver email to ${email}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;

