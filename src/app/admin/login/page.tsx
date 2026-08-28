import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata = {
  title: "Admin Login | Ixia",
  description: "Sign in to the Ixia admin dashboard.",
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cloud-gray px-5 py-12">
      <AdminLoginForm />
    </main>
  );
}
