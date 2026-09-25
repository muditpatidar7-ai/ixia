import { AdminDashboard } from "@/components/AdminDashboard";
import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "iXIA Influencer and Campaign Admin Dashboard",
  description: "Manage iXIA influencer registrations, applications, profiles, edit requests, email operations, and brand campaign workflows.",
  alternates: { canonical: canonicalUrl("/admin/dashboard") },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
