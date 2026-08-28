import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAuthClient } from "./supabaseServer";

type AdminAuthSuccess = {
  ok: true;
  user: {
    id: string;
    email?: string;
  };
};

type AdminAuthFailure = {
  ok: false;
  response: NextResponse;
};

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

const getBearerToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

const getAllowedAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const token = getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing admin session." }, { status: 401 }),
    };
  }

  let data;
  let error;

  try {
    const supabase = getSupabaseAuthClient();
    const result = await supabase.auth.getUser(token);
    data = result.data;
    error = result.error;
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Supabase auth environment variables are not configured." }, { status: 500 }),
    };
  }
  const email = data.user?.email?.toLowerCase();

  if (error || !data.user || !email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid or expired admin session." }, { status: 401 }),
    };
  }

  const allowedEmails = getAllowedAdminEmails();
  if (allowedEmails.length === 0) {
    return {
      ok: false,
      response: NextResponse.json({ error: "ADMIN_EMAILS is not configured." }, { status: 403 }),
    };
  }

  if (!allowedEmails.includes(email)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "This user is not allowed to access admin routes." }, { status: 403 }),
    };
  }

  return {
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  };
}
