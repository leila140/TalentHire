const baseStyles = `
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8fafc;
`;

const cardStyles = `
  max-width: 560px;
  margin: 40px auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  overflow: hidden;
`;

const headerStyles = `
  background: linear-gradient(135deg, #3b6bf5 0%, #6366f1 100%);
  padding: 32px 40px;
  text-align: center;
`;

const buttonStyles = `
  display: inline-block;
  background: linear-gradient(135deg, #3b6bf5 0%, #6366f1 100%);
  color: #ffffff !important;
  text-decoration: none;
  padding: 14px 36px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  margin: 24px 0;
`;

const footerStyles = `
  padding: 24px 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  border-top: 1px solid #f1f5f9;
`;

export const emailWrapper = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="${baseStyles}">
  <div style="${cardStyles}">
    <div style="${headerStyles}">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700;">TalentHire</h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0 0;">${title}</p>
    </div>
    <div style="padding: 40px;">
      ${content}
    </div>
    <div style="${footerStyles}">
      <p style="margin: 0;">© ${new Date().getFullYear()} TalentHire. All rights reserved.</p>
      <p style="margin: 4px 0 0 0;">An AI-powered recruitment platform</p>
    </div>
  </div>
</body>
</html>`;

export const verificationEmailTemplate = (url: string) =>
  emailWrapper(
    "Verify your email address",
    `
    <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">Welcome to TalentHire!</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Thank you for creating your account. Please verify your email address by clicking the button below.
    </p>
    <div style="text-align: center;">
      <a href="${url}" style="${buttonStyles}">Verify Email Address</a>
    </div>
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${url}" style="color: #3b6bf5; word-break: break-all;">${url}</a>
    </p>
    <p style="color: #94a3b8; font-size: 13px; margin: 16px 0 0 0;">
      This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
    </p>
    `
  );

export const resetPasswordEmailTemplate = (url: string) =>
  emailWrapper(
    "Reset your password",
    `
    <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">Password Reset Request</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      We received a request to reset your password. Click the button below to set a new password.
    </p>
    <div style="text-align: center;">
      <a href="${url}" style="${buttonStyles}">Reset Password</a>
    </div>
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${url}" style="color: #3b6bf5; word-break: break-all;">${url}</a>
    </p>
    <p style="color: #ef4444; font-size: 13px; margin: 16px 0 0 0;">
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
    `
  );

export const welcomeEmailTemplate = (name: string) =>
  emailWrapper(
    "Welcome aboard!",
    `
    <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">Hi ${name}!</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Your email has been verified and your account is now active. Here's what you can do next:
    </p>
    <ul style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
      <li>Complete your profile to stand out</li>
      <li>Browse and apply for jobs</li>
      <li>Get AI-powered resume feedback</li>
      <li>Connect with recruiters</li>
    </ul>
    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL}/dashboard" style="${buttonStyles}">Go to Dashboard</a>
    </div>
    `
  );

export const interviewScheduledEmailTemplate = (
  candidateName: string,
  jobTitle: string,
  date: string,
  meetingLink?: string
) =>
  emailWrapper(
    "Interview Scheduled",
    `
    <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">Interview Scheduled</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Hi ${candidateName}, an interview has been scheduled for the <strong>${jobTitle}</strong> position.
    </p>
    <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin: 0 0 24px 0;">
      <p style="color: #1e293b; font-size: 14px; margin: 0 0 8px 0;"><strong>Date & Time:</strong> ${date}</p>
      ${meetingLink ? `<p style="color: #1e293b; font-size: 14px; margin: 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #3b6bf5;">${meetingLink}</a></p>` : ""}
    </div>
    ${meetingLink ? `
    <div style="text-align: center;">
      <a href="${meetingLink}" style="${buttonStyles}">Join Meeting</a>
    </div>` : ""}
    <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0 0;">
      Please confirm your attendance from your TalentHire dashboard.
    </p>
    `
  );

export const newApplicationEmailTemplate = (
  recruiterName: string,
  candidateName: string,
  jobTitle: string
) =>
  emailWrapper(
    "New Application Received",
    `
    <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">New Application</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Hi ${recruiterName}, <strong>${candidateName}</strong> has applied for the <strong>${jobTitle}</strong> position.
    </p>
    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL}/jobs" style="${buttonStyles}">View Applications</a>
    </div>
    `
  );
