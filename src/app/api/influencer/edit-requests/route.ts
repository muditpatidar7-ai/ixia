import { NextResponse, type NextRequest } from "next/server";
import { requireInfluencer } from "@/lib/influencerAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireInfluencer(request);
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null);
  const requestedChanges = body?.requestedChanges;
  if (!requestedChanges || typeof requestedChanges !== "object" || Array.isArray(requestedChanges)) return NextResponse.json({ error: "Requested profile changes are required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("edit_requests").insert({ user_id: auth.influencer.id, requested_changes: requestedChanges, status: "pending" }).select("*").single();
  if (error) return NextResponse.json({ error: "Could not submit edit request." }, { status: 500 });
  return NextResponse.json({ editRequest: data }, { status: 201 });
}
