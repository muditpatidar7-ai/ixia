import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reset Your iXIA Influencer Account Password",
  description: "Recover access to your iXIA influencer account with secure email verification and create a new password for your creator dashboard.",
  alternates: { canonical: canonicalUrl("/forgot-password") },
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}