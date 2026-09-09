export function passwordResetEmail({ resetUrl }: { resetUrl: string }) {
  return { subject: "Reset your Ixia password", text: `Reset your Ixia password here: ${resetUrl}`, html: `<p>Reset your Ixia password by clicking <a href="${resetUrl}">this link</a>.</p><p>This link expires in 30 minutes.</p>` };
}
