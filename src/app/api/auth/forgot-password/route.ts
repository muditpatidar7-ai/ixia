import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data: user } = await supabase.from("influencers").select("id,email").eq("email", email).single();
  if (user) {
    const token = randomBytes(32).toString("hex");
    await supabase.from("influencers").update({ reset_token_hash: createHash("sha256").update(token).digest("hex"), reset_token_expiry: new Date(Date.now() + 30 * 60 * 1000).toISOString() }).eq("id", user.id);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    await sendPasswordResetEmail({ to: user.email, resetUrl: `${baseUrl}/reset-password?token=${token}` });
  }
  return NextResponse.json({ message: "If an account exists for that email, a reset link has been sent." });
}
