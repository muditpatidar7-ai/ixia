import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  const { data, error } = await getSupabaseAdminClient().from("edit_requests").select("*, influencers(full_name,email)").eq("status", "pending").order("requested_at", { ascending: true });
  return error ? NextResponse.json({ error: "Could not load edit requests." }, { status: 500 }) : NextResponse.json({ editRequests: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null); const id = typeof body?.id === "string" ? body.id : ""; const decision = body?.decision;
  if (!id || !["approved", "rejected"].includes(decision)) return NextResponse.json({ error: "Request id and approval decision are required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data: editRequest, error: fetchError } = await supabase.from("edit_requests").select("*").eq("id", id).eq("status", "pending").single();
  if (fetchError || !editRequest) return NextResponse.json({ error: "Edit request not found." }, { status: 404 });
  if (decision === "approved") {
    const allowed = ["full_name", "city", "state", "locality", "niches", "instagram_handle", "youtube_channel_link", "follower_count", "portfolio_link"];
    const changes = Object.fromEntries(Object.entries(editRequest.requested_changes ?? {}).filter(([key]) => allowed.includes(key)));
    const { error } = await supabase.from("influencers").update({ ...changes, last_updated_at: new Date().toISOString() }).eq("id", editRequest.user_id);
    if (error) return NextResponse.json({ error: "Could not apply profile changes." }, { status: 500 });
  }
  const { error } = await supabase.from("edit_requests").update({ status: decision, reviewed_at: new Date().toISOString() }).eq("id", id);
  return error ? NextResponse.json({ error: "Could not review edit request." }, { status: 500 }) : NextResponse.json({ message: `Edit request ${decision}.` });
}
