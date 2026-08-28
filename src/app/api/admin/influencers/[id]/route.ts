import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { toInfluencerDbPayload, validateInfluencerPayload } from "@/lib/validation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ errors: { form: "Request body must be valid JSON." } }, { status: 400 });
  }

  const validation = validateInfluencerPayload(payload);
  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const { id } = await context.params;
  let supabase;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return NextResponse.json({ errors: { form: "Supabase server environment variables are not configured." } }, { status: 500 });
  }
  const { data, error } = await supabase
    .from("influencers")
    .update(toInfluencerDbPayload(validation.data))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ errors: { form: "Could not update influencer." } }, { status: 500 });
  }

  return NextResponse.json({ influencer: data });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  let supabase;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return NextResponse.json({ error: "Supabase server environment variables are not configured." }, { status: 500 });
  }
  const { error } = await supabase.from("influencers").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not delete influencer." }, { status: 500 });
  }

  return NextResponse.json({ message: "Influencer deleted." });
}
