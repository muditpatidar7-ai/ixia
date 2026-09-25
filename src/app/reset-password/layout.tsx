import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create a New iXIA Account Password",
  description: "Set a new secure password for your iXIA influencer account and return to the creator login screen.",
  alternates: { canonical: canonicalUrl("/reset-password") },
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}