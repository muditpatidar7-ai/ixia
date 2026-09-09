export function otpVerificationEmail({ fullName, otp }: { fullName: string; otp: string }) {
  return {
    subject: "Your Ixia verification code",
    text: `Hi ${fullName || "there"}, your Ixia verification code is ${otp}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Verify your Ixia account</h2><p>Hi ${fullName || "there"},</p><p>Your verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p><p>This code expires in 10 minutes.</p></div>`,
  };
}
