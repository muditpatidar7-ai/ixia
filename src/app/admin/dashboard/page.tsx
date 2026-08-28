import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin Dashboard | Ixia",
  description: "Manage Ixia influencer registrations.",
};

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
