import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Influencer Login for Local Brand Campaigns",
  description: "Sign in to your iXIA influencer account to review local brand opportunities, manage applications, and track paid creator campaigns.",
  alternates: { canonical: canonicalUrl("/influencer/login") },
  robots: { index: false, follow: false },
};

export default function InfluencerLoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}