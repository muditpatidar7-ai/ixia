import { NextResponse, type NextRequest } from "next/server";

import { sendConfirmationEmail } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { toInfluencerDbPayload, validateInfluencerPayload } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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

  let supabase;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return NextResponse.json(
      { errors: { form: "Supabase server environment variables are not configured." } },
      { status: 500 },
    );
  }
  const { data, error } = await supabase
    .from("influencers")
    .insert({
      ...toInfluencerDbPayload(validation.data),
      confirmation_email_status: "pending",
    })
    .select("id,email,full_name")
    .single();

  if (error) {
    const isDuplicateEmail = error.code === "23505";
    return NextResponse.json(
      {
        errors: {
          form: isDuplicateEmail
            ? "An influencer with this email is already registered."
            : "Could not save the registration. Please try again.",
        },
      },
      { status: isDuplicateEmail ? 409 : 500 },
    );
  }

  const emailResult = await sendConfirmationEmail({
    to: data.email,
    fullName: data.full_name,
  });

  await supabase
    .from("influencers")
    .update({
      confirmation_email_status: emailResult.status,
      confirmation_email_sent_at: emailResult.status === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", data.id);

  return NextResponse.json(
    {
      id: data.id,
      message: "Registration received.",
      emailStatus: emailResult.status,
    },
    { status: 201 },
  );
}
