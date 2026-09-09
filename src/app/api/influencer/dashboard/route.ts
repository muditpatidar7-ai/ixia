import { NextResponse, type NextRequest } from "next/server";
import { requireInfluencer } from "@/lib/influencerAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireInfluencer(request);
  if (!auth.ok) return auth.response;
  const supabase = getSupabaseAdminClient();
  const { data: campaigns, error } = await supabase.from("campaigns").select("*, applications!left(status,user_id)").order("deadline", { ascending: true });
  if (error) return NextResponse.json({ error: "Could not load campaigns." }, { status: 500 });
  return NextResponse.json({ profile: auth.influencer, campaigns: campaigns ?? [] });
}
