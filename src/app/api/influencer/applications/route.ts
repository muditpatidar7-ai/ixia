import { NextResponse, type NextRequest } from "next/server";
import { requireInfluencer } from "@/lib/influencerAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireInfluencer(request);
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null);
  const campaignId = typeof body?.campaignId === "string" ? body.campaignId : "";
  if (!campaignId) return NextResponse.json({ error: "Campaign is required." }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("applications").insert({ user_id: auth.influencer.id, campaign_id: campaignId, status: "applied" }).select("*").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "You have already applied to this campaign." : "Could not apply to campaign." }, { status: error.code === "23505" ? 409 : 500 });
  return NextResponse.json({ application: data }, { status: 201 });
}
