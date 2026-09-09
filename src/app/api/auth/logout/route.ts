import { NextResponse } from "next/server";

import { clearInfluencerSession } from "@/lib/influencerAuth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out." });
  clearInfluencerSession(response);
  return response;
}
