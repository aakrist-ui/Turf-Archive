const nodemailer = require('nodemailer');

const getEmailConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
    from,
  };
};

exports.sendResetPasswordEmail = async ({ to, resetToken }) => {
  const config = getEmailConfig();

  if (!config) {
    console.log('SMTP not configured. Reset token for', to, ':', resetToken);
    return {
      sent: false,
      reason: 'smtp_not_configured',
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  const resetUrlBase = process.env.APP_RESET_URL || 'turfarchive://reset-password';
  const resetUrl = `${resetUrlBase}${resetUrlBase.includes('?') ? '&' : '?'}token=${encodeURIComponent(resetToken)}`;

  await transporter.sendMail({
    from: config.from,
    to,
    subject: 'Reset your Turf Archive password',
    text: [
      'We received a request to reset your password.',
      '',
      `Reset link: ${resetUrl}`,
      `Reset code: ${resetToken}`,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2>Reset your Turf Archive password</h2>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">
            Reset Password
          </a>
        </p>
        <p><strong>Reset code:</strong> ${resetToken}</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return {
    sent: true,
  };
};
