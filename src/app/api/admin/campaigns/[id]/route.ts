import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null); const { id } = await context.params;
  const allowed = ["title", "brand_name", "category", "location", "budget", "deadline", "description"];
  const changes = Object.fromEntries(Object.entries(body ?? {}).filter(([key, value]) => allowed.includes(key) && typeof value === "string"));
  const { data, error } = await getSupabaseAdminClient().from("campaigns").update(changes).eq("id", id).select("*").single();
  return error ? NextResponse.json({ error: "Could not update campaign." }, { status: 500 }) : NextResponse.json({ campaign: data });
}

export async function DELETE(request: NextRequest, context: Context) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  const { id } = await context.params; const { error } = await getSupabaseAdminClient().from("campaigns").delete().eq("id", id);
  return error ? NextResponse.json({ error: "Could not delete campaign." }, { status: 500 }) : NextResponse.json({ message: "Campaign deleted." });
}
