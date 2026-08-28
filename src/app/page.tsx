import Link from "next/link";

const headlineOptions = [
  "Turn your following into real local partnerships",
  "Get booked by brands in your own city",
  "Turn your content into consistent local work",
];

const benefits = [
  {
    title: "Get matched with real local businesses",
    description:
      "We connect you with nearby cafés, gyms, salons, shops, and brands that actually fit your style and audience — no random brand spam.",
  },
  {
    title: "Set your own rate",
    description:
      "You choose what you charge. No lowball offers, no pressure, and no wasted time chasing brands that are not a fit.",
  },
  {
    title: "Fast, simple process",
    description:
      "Register once, get verified, and start getting matched with opportunities. No endless back-and-forth or complicated onboarding.",
  },
  {
    title: "Build repeat local work",
    description:
      "Create strong relationships with businesses in your area and turn one campaign into ongoing collaborations.",
  },
];

const steps = [
  "Register and get verified",
  "Get matched with nearby businesses that fit your niche",
  "Create content for the brief and deliver on time",
  "Get approved and get paid",
];

const faqs = [
  {
    question: "Do I need a certain number of followers?",
    answer: "No minimum follower count is required. We care more about authentic engagement, local relevance, and content quality than raw numbers.",
  },
  {
    question: "How do I get paid?",
    answer: "Payment is released a fixed number of days after your content is delivered and approved. Exact payout method and timeline details will be shared during onboarding.",
  },
  {
    question: "What if a brand doesn't respond?",
    answer: "Once you're matched, the shoot date depends on the brand's schedule and availability — our team will keep you updated if there's any delay on their end.",
  },
  {
    question: "Is there a fee to join?",
    answer: "No. There is no joining fee and no platform fee to become an iXIA influencer.",
  },
  {
    question: "How long does verification take?",
    answer: "Once you register, you'll receive a verification email 7 days before your scheduled Google Meet review.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#FAF3E4] text-[#120C22]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#120C22]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-2xl font-bold tracking-[-0.04em] text-white">
            iXIA
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-[#E8B93D] px-4 py-2 text-sm font-semibold text-[#120C22] transition hover:bg-[#FAF3E4]"
            >
              Register as an Influencer
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-32 sm:px-8 lg:pt-36">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#C79A2E]">
              Creator opportunities. Real local brands.
            </p>
            <h1 className="max-w-xl text-4xl font-bold tracking-[-0.05em] text-[#120C22] sm:text-5xl lg:text-7xl">
              {headlineOptions[0]}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#120C22]/75">
              iXIA helps creators get matched with businesses in their own area, build better partnerships,
              and turn their content into consistent paid work.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-[#E8B93D] px-6 py-3 text-center text-sm font-semibold text-[#120C22] transition hover:bg-[linear-gradient(45deg,#FEDA75_0%,#FA7E1E_20%,#D62976_45%,#962FBF_70%,#4F5BD5_100%)]"
              >
                Register as an Influencer
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-[#120C22]/10 bg-[#F0E1BE] p-4 shadow-[0_25px_80px_-40px_rgba(18,12,34,0.5)]">
              <div className="rounded-[28px] border border-[#120C22]/10 bg-[#120C22] p-5 text-white">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
                      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
                    ].map((src, index) => (
                      <div
                        key={src}
                        className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#FAF3E4]"
                        style={{
                          background: "linear-gradient(45deg, #FEDA75 0%, #FA7E1E 20%, #D62976 45%, #962FBF 70%, #4F5BD5 100%)",
                          padding: index === 0 ? "2px" : "0",
                        }}
                      >
                        <img src={src} alt="Creator" className="h-full w-full rounded-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Local creators</p>
                    <p className="text-xs text-white/70">Active this week</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#E8B93D]">New match</p>
                    <p className="mt-2 text-lg font-semibold">Local café campaign</p>
                    <p className="mt-1 text-sm text-white/70">Food creator • Bengaluru</p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#E8B93D]">Status</p>
                    <p className="mt-2 text-lg font-semibold">Accept or Reject</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 rounded-full border border-[#120C22]/10 bg-[#FAF3E4] px-4 py-3 shadow-lg">
              <p className="text-xs uppercase tracking-[0.18em] text-[#C79A2E]">Local brands</p>
              <p className="font-semibold text-[#120C22]">[X] businesses</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#120C22] px-5 py-20 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8B93D]">Why join iXIA</p>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/75">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C79A2E]">How it works</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#120C22] sm:text-4xl">
            Create content. Get matched. Get paid.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-[24px] border border-[#120C22]/10 bg-white/80 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(45deg,#FEDA75_0%,#FA7E1E_20%,#D62976_45%,#962FBF_70%,#4F5BD5_100%)] font-semibold text-[#120C22]">
                {index + 1}
              </div>
              <p className="text-lg font-semibold text-[#120C22]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F0E1BE] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C79A2E]">Who we look for</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#120C22] sm:text-4xl">
            Authentic creators with local reach.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#120C22]/75">
            We&apos;re looking for creators who create content in a way that feels real, local, and relatable. If you create in the area you serve, have an active and engaged audience, and show up professionally, you&apos;re a strong fit. Placeholder: add any minimum follower requirement or content quality standard here later.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C79A2E]">Built on trust</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#120C22] sm:text-4xl">
            A network creators can grow with.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            "[X] local businesses",
            "[X] creators onboarded",
            "[X] campaigns completed",
          ].map((stat) => (
            <div key={stat} className="rounded-[24px] border border-[#120C22]/10 bg-white/80 p-8 text-center">
              <p className="text-4xl font-bold tracking-[-0.05em] text-[#120C22]">{stat}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            "“iXIA made it easy to get matched with brands that actually fit my niche and city.” — Placeholder creator quote",
            "“The process was simple, fast, and way more professional than random DM outreach.” — Placeholder creator quote",
          ].map((quote) => (
            <blockquote key={quote} className="rounded-[24px] border border-[#120C22]/10 bg-[#120C22] p-6 text-white">
              <p className="text-lg leading-8 text-white/90">{quote}</p>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-[#120C22] px-5 py-20 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8B93D]">FAQ</p>
          <div className="mt-6 space-y-4">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-[20px] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-semibold text-white">{item.question}</p>
                <p className="mt-2 text-sm leading-7 text-white/75">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">
        <p className="text-lg text-[#120C22]/80">
          Your neighborhood is full of brands looking for someone like you.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex rounded-full bg-[#E8B93D] px-7 py-3 text-base font-semibold text-[#120C22] transition hover:bg-[linear-gradient(45deg,#FEDA75_0%,#FA7E1E_20%,#D62976_45%,#962FBF_70%,#4F5BD5_100%)]"
        >
          Register as an Influencer
        </Link>
      </section>
    </main>
  );
}
