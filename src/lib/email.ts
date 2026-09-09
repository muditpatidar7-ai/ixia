import { influencerConfirmationEmail } from "@/emails/influencerConfirmation";
import { otpVerificationEmail } from "@/emails/otpVerification";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type EmailResult = {
  status: "sent" | "failed" | "skipped";
  provider?: string;
  error?: string;
};

async function sendWithBrevo({ to, subject, html, text }: SendEmailArgs): Promise<EmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? process.env.EMAIL_FROM;
  const senderName = process.env.BREVO_SENDER_NAME ?? "iXIA";

  if (!apiKey || !senderEmail) {
    return { status: "skipped", provider: "brevo", error: "Missing BREVO_API_KEY or BREVO_SENDER_EMAIL." };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { status: "failed", provider: "brevo", error };
  }

  return { status: "sent", provider: "brevo" };
}

export async function sendConfirmationEmail(args: { to: string; fullName: string }): Promise<EmailResult> {
  const email = influencerConfirmationEmail({ fullName: args.fullName });

  try {
    return sendWithBrevo({ to: args.to, ...email });
  } catch (error) {
    return {
      status: "failed",
      provider: "brevo",
      error: error instanceof Error ? error.message : "Unknown email error.",
    };
  }
}

export async function sendOtpEmail(args: { to: string; fullName: string; otp: string }): Promise<EmailResult> {
  const email = otpVerificationEmail(args);
  try {
    return await sendWithBrevo({ to: args.to, ...email });
  } catch (error) {
    return { status: "failed", provider: "brevo", error: error instanceof Error ? error.message : "Brevo error." };
  }
}

