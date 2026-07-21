import nodemailer from "nodemailer";
import {
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
  welcomeEmailTemplate,
  interviewScheduledEmailTemplate,
  newApplicationEmailTemplate,
} from "./emailTemplates";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"TalentHire" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail(to, "Verify your email — TalentHire", verificationEmailTemplate(url));
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail(to, "Reset your password — TalentHire", resetPasswordEmailTemplate(url));
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  await sendEmail(to, "Welcome to TalentHire!", welcomeEmailTemplate(name));
};

export const sendInterviewScheduledEmail = async (
  to: string,
  candidateName: string,
  jobTitle: string,
  date: string,
  meetingLink?: string
) => {
  await sendEmail(
    to,
    `Interview Scheduled: ${jobTitle} — TalentHire`,
    interviewScheduledEmailTemplate(candidateName, jobTitle, date, meetingLink)
  );
};

export const sendNewApplicationEmail = async (
  to: string,
  recruiterName: string,
  candidateName: string,
  jobTitle: string
) => {
  await sendEmail(
    to,
    `New Application: ${jobTitle} — TalentHire`,
    newApplicationEmailTemplate(recruiterName, candidateName, jobTitle)
  );
};
