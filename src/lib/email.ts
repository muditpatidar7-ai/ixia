import { influencerConfirmationEmail } from "@/emails/influencerConfirmation";

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

const getProvider = () => {
  const configuredProvider = process.env.EMAIL_PROVIDER?.toLowerCase();
  if (configuredProvider) {
    return configuredProvider;
  }
  if (process.env.RESEND_API_KEY) {
    return "resend";
  }
  if (process.env.SENDGRID_API_KEY) {
    return "sendgrid";
  }
  return null;
};

async function sendWithResend({ to, subject, html, text }: SendEmailArgs): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { status: "skipped", provider: "resend", error: "Missing RESEND_API_KEY or EMAIL_FROM." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { status: "failed", provider: "resend", error };
  }

  return { status: "sent", provider: "resend" };
}

async function sendWithSendGrid({ to, subject, html, text }: SendEmailArgs): Promise<EmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { status: "skipped", provider: "sendgrid", error: "Missing SENDGRID_API_KEY or EMAIL_FROM." };
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { status: "failed", provider: "sendgrid", error };
  }

  return { status: "sent", provider: "sendgrid" };
}

export async function sendConfirmationEmail(args: { to: string; fullName: string }): Promise<EmailResult> {
  const email = influencerConfirmationEmail({ fullName: args.fullName });
  const provider = getProvider();

  try {
    if (provider === "resend") {
      return sendWithResend({ to: args.to, ...email });
    }

    if (provider === "sendgrid") {
      return sendWithSendGrid({ to: args.to, ...email });
    }

    return { status: "skipped", error: "No email provider configured." };
  } catch (error) {
    return {
      status: "failed",
      provider: provider ?? undefined,
      error: error instanceof Error ? error.message : "Unknown email error.",
    };
  }
}
