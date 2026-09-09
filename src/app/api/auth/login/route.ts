import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { setInfluencerSession, signInfluencerToken, verifyPassword } from "@/lib/influencerAuth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { data: user } = await supabase.from("influencers").select("id,email,password_hash,email_verified").eq("email", email).single();
  if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  if (!user.email_verified) return NextResponse.json({ error: "Please verify your email before logging in.", requiresVerification: true }, { status: 403 });

  const response = NextResponse.json({ message: "Logged in." });
  setInfluencerSession(response, signInfluencerToken({ sub: user.id, email: user.email }));
  return response;
}
