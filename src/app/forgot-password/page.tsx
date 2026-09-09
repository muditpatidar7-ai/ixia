"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState("");
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const result = await response.json(); setMessage(result.message ?? result.error); };
  return <main className="flex min-h-screen items-center justify-center bg-cloud-gray px-5"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-3xl font-semibold text-forest-green">Forgot password</h1><p className="mt-3 text-sm text-slate-600">Enter your email and we will send a reset link.</p>{message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-6 w-full rounded-xl border p-3" placeholder="creator@example.com" /><button className="mt-5 w-full rounded-xl bg-terracotta px-4 py-3 font-semibold text-white">Send reset link</button></form></main>;
}
