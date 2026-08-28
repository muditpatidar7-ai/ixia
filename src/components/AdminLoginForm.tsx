"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export function AdminLoginForm() {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/admin/dashboard");
      }
    });
  }, [router, supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase public environment variables are not configured yet.");
      return;
    }

    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/admin/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[34px] border border-forest-green/15 bg-white/85 p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-blue">Admin login</p>
        <h1 className="mt-3 text-3xl font-semibold text-forest-green">Sign in to Ixia</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Use a Supabase Auth email/password account listed in the app&apos;s ADMIN_EMAILS environment variable.
        </p>
      </div>

      {!supabase ? (
        <div className="mt-6 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` to enable admin login.
        </div>
      ) : null}

      {error ? <div className="mt-6 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

      <label className="mt-6 block text-sm font-semibold text-slate-900">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-[18px] border border-forest-green/25 bg-white/85 px-4 py-3 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
          placeholder="admin@ixia.com"
        />
      </label>

      <label className="mt-5 block text-sm font-semibold text-slate-900">
        Password
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-[18px] border border-forest-green/25 bg-white/85 px-4 py-3 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
          placeholder="Your password"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting || !supabase}
        className="mt-6 w-full rounded-[22px] bg-terracotta px-5 py-3 text-sm font-semibold text-white transition hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <Link href="/" className="mt-4 block rounded-[22px] border border-forest-green/30 px-5 py-3 text-center text-sm font-semibold text-forest-green transition hover:border-forest-green">
        Back to landing page
      </Link>
    </form>
  );
}
