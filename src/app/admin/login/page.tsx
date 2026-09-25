import { AdminLoginForm } from "@/components/AdminLoginForm";
import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "iXIA Admin Dashboard Login and Access",
  description: "Sign in securely to the iXIA admin dashboard to manage influencer applications, campaigns, profiles, and collaboration operations.",
  alternates: { canonical: canonicalUrl("/admin/login") },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cloud-gray px-5 py-12">
      <AdminLoginForm />
    </main>
  );
}
