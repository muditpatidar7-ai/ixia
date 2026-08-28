import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  let supabase;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return NextResponse.json({ error: "Supabase server environment variables are not configured." }, { status: 500 });
  }
  const { data, error } = await supabase.from("influencers").select("*").order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load influencers." }, { status: 500 });
  }

  return NextResponse.json({ influencers: data ?? [] });
}
