import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Influencer Campaign Dashboard",
  description: "View your iXIA creator profile, local brand matches, campaign applications, and paid influencer collaboration opportunities.",
  alternates: { canonical: canonicalUrl("/influencer/dashboard") },
  robots: { index: false, follow: false },
};

export default function InfluencerDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}