import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  const { data, error } = await getSupabaseAdminClient().from("campaigns").select("*").order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: "Could not load campaigns." }, { status: 500 }) : NextResponse.json({ campaigns: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null);
  const required = ["title", "brand_name", "category", "location", "budget", "deadline"];
  if (!body || required.some((key) => typeof body[key] !== "string" || !body[key].trim())) return NextResponse.json({ error: "Title, brand, category, location, budget, and deadline are required." }, { status: 400 });
  const { data, error } = await getSupabaseAdminClient().from("campaigns").insert({ title: body.title.trim(), brand_name: body.brand_name.trim(), category: body.category.trim(), location: body.location.trim(), budget: body.budget.trim(), deadline: body.deadline, description: typeof body.description === "string" ? body.description.trim() : "", created_by: auth.user.id }).select("*").single();
  return error ? NextResponse.json({ error: "Could not create campaign." }, { status: 500 }) : NextResponse.json({ campaign: data }, { status: 201 });
}
