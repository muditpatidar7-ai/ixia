import { createHash } from "node:crypto";
import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { signInfluencerToken, setInfluencerSession } from "@/lib/influencerAuth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
  const purpose = body?.purpose === "reset" ? "reset" : "login";
  if (!email || !/^\d{6}$/.test(otp)) return NextResponse.json({ error: "Enter the 6-digit verification code." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { data: user } = await supabase.from("influencers").select("id,email,full_name,otp_hash,otp_expiry").eq("email", email).single();
  if (!user || user.otp_hash !== createHash("sha256").update(otp).digest("hex") || !user.otp_expiry || new Date(user.otp_expiry) < new Date()) {
    return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
  }

  if (purpose === "reset") {
    const resetToken = randomBytes(32).toString("hex");
    const { error } = await supabase.from("influencers").update({ otp_hash: null, otp_expiry: null, reset_token_hash: createHash("sha256").update(resetToken).digest("hex"), reset_token_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString() }).eq("id", user.id);
    if (error) return NextResponse.json({ error: "Could not verify the reset code." }, { status: 500 });
    return NextResponse.json({ message: "OTP verified.", resetToken });
  }

  const { error } = await supabase.from("influencers").update({ email_verified: true, otp_hash: null, otp_expiry: null }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Could not activate the account." }, { status: 500 });

  const response = NextResponse.json({ message: "Account verified." });
  setInfluencerSession(response, signInfluencerToken({ sub: user.id, email: user.email }));
  return response;
}
