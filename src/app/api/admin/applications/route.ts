import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  const { data, error } = await getSupabaseAdminClient().from("applications").select("*, influencers(full_name,email), campaigns(title,brand_name)").order("applied_at", { ascending: false });
  return error ? NextResponse.json({ error: "Could not load applications." }, { status: 500 }) : NextResponse.json({ applications: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null); const id = typeof body?.id === "string" ? body.id : ""; const status = body?.status;
  if (!id || !["applied", "shortlisted", "confirmed", "completed"].includes(status)) return NextResponse.json({ error: "Application id and valid status are required." }, { status: 400 });
  const { data, error } = await getSupabaseAdminClient().from("applications").update({ status }).eq("id", id).select("*").single();
  return error ? NextResponse.json({ error: "Could not update application." }, { status: 500 }) : NextResponse.json({ application: data });
}
