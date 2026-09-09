import { createHash, randomInt } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { sendOtpEmail } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data: user } = await supabase.from("influencers").select("id,email,full_name,email_verified").eq("email", email).single();
  if (!user || user.email_verified) return NextResponse.json({ message: "If that account needs verification, a new code has been sent." });

  const otp = String(100000 + randomInt(900000));
  await supabase.from("influencers").update({ otp_hash: createHash("sha256").update(otp).digest("hex"), otp_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString() }).eq("id", user.id);
  const result = await sendOtpEmail({ to: user.email, fullName: user.full_name, otp });
  return NextResponse.json({ message: result.status === "sent" ? "A new code has been sent." : "OTP delivery is not configured." }, { status: result.status === "failed" ? 500 : 200 });
}
