import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Verify Your iXIA Influencer Email Account",
  description: "Verify your iXIA influencer account with the latest email OTP to access local creator opportunities and brand campaign applications.",
  alternates: { canonical: canonicalUrl("/verify-email") },
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}