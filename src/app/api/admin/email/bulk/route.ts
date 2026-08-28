import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await request.json().catch(() => ({}));
  const influencerIds = Array.isArray(payload.influencerIds) ? payload.influencerIds : [];

  return NextResponse.json(
    {
      message: "Bulk email delivery is scaffolded but not enabled yet.",
      nextStep: "Create an email_campaign row, populate email_campaign_recipients, then send via Resend, SendGrid, or a Supabase Edge Function.",
      selectedInfluencerCount: influencerIds.length,
    },
    { status: 501 },
  );
}
