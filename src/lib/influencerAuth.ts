import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAdminClient } from "./supabaseServer";

const COOKIE_NAME = "ixia_influencer_session";
const TOKEN_AGE = 60 * 60 * 24 * 7;

type SessionPayload = { sub: string; email: string; role: "influencer" };

const getSecret = () => {
  const secret = process.env.JWT_SECRET ?? (process.env.NODE_ENV === "development" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return secret;
};

export const hashPassword = (password: string) => hash(password, 12);
export const verifyPassword = (password: string, hashed: string) => compare(password, hashed);
export const signInfluencerToken = (payload: Omit<SessionPayload, "role">) =>
  jwt.sign({ ...payload, role: "influencer" }, getSecret(), { expiresIn: TOKEN_AGE });

export function setInfluencerSession(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_AGE,
    path: "/",
  });
}

export function clearInfluencerSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

const getToken = (request: NextRequest) => request.cookies.get(COOKIE_NAME)?.value ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

export async function requireInfluencer(request: NextRequest) {
  const token = getToken(request);
  if (!token) return { ok: false as const, response: NextResponse.json({ error: "Influencer login required." }, { status: 401 }) };

  try {
    const payload = jwt.verify(token, getSecret()) as SessionPayload;
    if (payload.role !== "influencer") throw new Error("Invalid role");
    const supabase = getSupabaseAdminClient();
    const { data: influencer, error } = await supabase.from("influencers").select("*").eq("id", payload.sub).single();
    if (error || !influencer || !influencer.email_verified) {
      return { ok: false as const, response: NextResponse.json({ error: "Email verification is required." }, { status: 403 }) };
    }
    return { ok: true as const, influencer };
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: "Invalid or expired influencer session." }, { status: 401 }) };
  }
}

export async function getInfluencerFromCookies() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret()) as SessionPayload;
    if (payload.role !== "influencer") return null;
    return payload;
  } catch {
    return null;
  }
}
