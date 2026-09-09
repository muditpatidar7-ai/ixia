"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter(); const [token, setToken] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  useEffect(() => setToken(new URLSearchParams(window.location.search).get("token") ?? ""), []);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const result = await response.json(); if (!response.ok) { setError(result.error); return; } setMessage(result.message); setTimeout(() => router.replace("/influencer/login"), 800); };
  return <main className="flex min-h-screen items-center justify-center bg-cloud-gray px-5"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-3xl font-semibold text-forest-green">Reset password</h1>{error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}{message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-6 w-full rounded-xl border p-3" placeholder="New password" /><button className="mt-5 w-full rounded-xl bg-terracotta px-4 py-3 font-semibold text-white">Save password</button></form></main>;
}
