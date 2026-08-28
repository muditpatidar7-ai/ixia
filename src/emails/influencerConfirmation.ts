type ConfirmationEmailArgs = {
  fullName: string;
};

export function influencerConfirmationEmail({ fullName }: ConfirmationEmailArgs) {
  const safeName = fullName.trim() || "there";
  const subject = "Ixia received your influencer registration";
  const text = [
    `Hi ${safeName},`,
    "",
    "Thank you for registering with Ixia. We have received your creator profile and our team will review it shortly.",
    "",
    "If there is a strong fit for an upcoming collaboration, the Ixia team will contact you directly by email soon.",
    "",
    "Warmly,",
    "The Ixia Team",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6; max-width: 620px;">
      <h1 style="font-size: 24px; margin: 0 0 16px;">Thanks for registering with Ixia</h1>
      <p>Hi ${safeName},</p>
      <p>Thank you for registering with Ixia. We have received your creator profile and our team will review it shortly.</p>
      <p>If there is a strong fit for an upcoming collaboration, the Ixia team will contact you directly by email soon.</p>
      <p style="margin-top: 28px;">Warmly,<br />The Ixia Team</p>
    </div>
  `;

  return { subject, text, html };
}
