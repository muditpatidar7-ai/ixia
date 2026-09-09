import { NextResponse, type NextRequest } from "next/server";
import { createHash, randomInt } from "node:crypto";

import { sendOtpEmail } from "@/lib/email";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { hashPassword } from "@/lib/influencerAuth";
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
  const otp = String(100000 + randomInt(900000));
  const accountPayload = {
      ...toInfluencerDbPayload(validation.data),
      password_hash: await hashPassword(validation.data.password),
      email_verified: false,
      is_admin_verified: false,
      otp_hash: createHash("sha256").update(otp).digest("hex"),
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      confirmation_email_status: "pending",
  };
  const { data: existing } = await supabase.from("influencers").select("id,email_verified").eq("email", validation.data.email).maybeSingle();
  if (existing?.email_verified) {
    return NextResponse.json({ errors: { form: "An influencer with this email is already verified. Use Forgot Password if you need to change the password." } }, { status: 409 });
  }

  const query = existing
    ? supabase.from("influencers").update(accountPayload).eq("id", existing.id).select("id,email,full_name").single()
    : supabase.from("influencers").insert(accountPayload).select("id,email,full_name").single();
  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      {
        errors: {
          form: "Could not save the registration. Please try again.",
        },
      },
      { status: 500 },
    );
  }

  const emailResult = await sendOtpEmail({
    to: data.email,
    fullName: data.full_name,
    otp,
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
      message: emailResult.status === "sent"
        ? "Registration received. Check your email for the verification code."
        : "Registration saved, but the OTP email could not be delivered. Use Resend OTP on the verification screen.",
      emailStatus: emailResult.status,
    },
    { status: 201 },
  );
}
