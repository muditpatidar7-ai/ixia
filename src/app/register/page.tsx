import { RegistrationForm } from "@/components/RegistrationForm";

export const metadata = {
  title: "Register as an Influencer | Ixia",
  description: "Apply to join Ixia as a creator or influencer.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-cloud-gray">
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-blue">Creator registration</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-forest-green sm:text-5xl">
            Register your profile with Ixia.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Share your creator details, platforms, categories, and collaboration preferences so the Ixia team can match you with the right brand opportunities.
          </p>
        </div>
        <RegistrationForm />
      </section>
    </main>
  );
}
