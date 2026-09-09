"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const router = useRouter(); const [otp, setOtp] = useState(""); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [email, setEmail] = useState("");
  useEffect(() => setEmail(new URLSearchParams(window.location.search).get("email") ?? ""), []);
  const verify = async (event: React.FormEvent) => { event.preventDefault(); const response = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) }); const result = await response.json(); if (!response.ok) { setError(result.error); return; } router.replace("/influencer/dashboard"); };
  const resend = async () => { const response = await fetch("/api/auth/resend-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const result = await response.json(); setMessage(result.message ?? result.error); };
  return <main className="flex min-h-screen items-center justify-center bg-cloud-gray px-5"><form onSubmit={verify} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"><p className="text-sm font-semibold uppercase tracking-widest text-steel-blue">Email verification</p><h1 className="mt-3 text-3xl font-semibold text-forest-green">Enter your 6-digit OTP</h1><p className="mt-3 text-sm text-slate-600">We sent a code to {email}. It expires in 10 minutes.</p>{error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}{message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} className="mt-6 w-full rounded-xl border p-4 text-center text-2xl tracking-[0.5em]" placeholder="000000" /><button className="mt-5 w-full rounded-xl bg-terracotta px-4 py-3 font-semibold text-white">Verify account</button><button type="button" onClick={() => void resend()} className="mt-4 w-full rounded-xl border border-forest-green px-4 py-3 font-semibold text-forest-green">Resend OTP</button></form></main>;
}
