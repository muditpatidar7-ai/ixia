import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { hashPassword } from "@/lib/influencerAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";
  if (!token || password.length < 8) return NextResponse.json({ error: "A valid token and password of at least 8 characters are required." }, { status: 400 });
  if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data: user } = await supabase.from("influencers").select("id,reset_token_expiry").eq("reset_token_hash", createHash("sha256").update(token).digest("hex")).single();
  if (!user || !user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date()) return NextResponse.json({ error: "That reset link is invalid or expired." }, { status: 400 });
  const { error } = await supabase.from("influencers").update({ password_hash: await hashPassword(password), reset_token_hash: null, reset_token_expiry: null }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  return NextResponse.json({ message: "Password reset successfully." });
}
