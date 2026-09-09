"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json();
    setIsSubmitting(false);
    if (!response.ok) { setError(result.error ?? "Could not send OTP."); return; }
    setMessage(result.message);
    setStep("otp");
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const response = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp, purpose: "reset" }) });
    const result = await response.json();
    setIsSubmitting(false);
    if (!response.ok) { setError(result.error ?? "Invalid or expired OTP."); return; }
    setResetToken(result.resetToken);
    setMessage("Email confirmed. Create your new password.");
    setStep("password");
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setIsSubmitting(true);
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: resetToken, password, confirmPassword }) });
    const result = await response.json();
    setIsSubmitting(false);
    if (!response.ok) { setError(result.error ?? "Could not reset password."); return; }
    setMessage("Password changed successfully. Redirecting to login...");
    setTimeout(() => router.replace("/influencer/login"), 900);
  };

  return <main className="flex min-h-screen items-center justify-center bg-cloud-gray px-5 py-10"><form onSubmit={step === "email" ? submitEmail : step === "otp" ? verifyOtp : resetPassword} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"><p className="text-sm font-semibold uppercase tracking-widest text-steel-blue">Account recovery</p><h1 className="mt-3 text-3xl font-semibold text-forest-green">{step === "email" ? "Forgot password" : step === "otp" ? "Confirm your email" : "Create a new password"}</h1><p className="mt-3 text-sm text-slate-600">{step === "email" ? "Enter your email and we will send a 6-digit OTP." : step === "otp" ? `Enter the OTP sent to ${email}. It expires in 10 minutes.` : "Choose a new password and confirm it below."}</p>{error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}{message ? <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}{step === "email" ? <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-6 w-full rounded-xl border p-3" placeholder="creator@example.com" /> : null}{step === "otp" ? <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} className="mt-6 w-full rounded-xl border p-4 text-center text-2xl tracking-[0.5em]" placeholder="000000" /> : null}{step === "password" ? <div className="mt-6 space-y-4"><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border p-3" placeholder="New password" /><input required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border p-3" placeholder="Confirm new password" /></div> : null}<button disabled={isSubmitting} className="mt-5 w-full rounded-xl bg-terracotta px-4 py-3 font-semibold text-white transition hover:bg-terracotta/90 active:bg-forest-green disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Please wait..." : step === "email" ? "Send OTP" : step === "otp" ? "Confirm OTP" : "Change password"}</button>{step === "otp" ? <button type="button" disabled={isSubmitting} onClick={() => void submitEmail(new Event("submit") as unknown as React.FormEvent)} className="mt-3 w-full rounded-xl border border-forest-green px-4 py-3 font-semibold text-forest-green transition hover:bg-forest-green/10 active:bg-forest-green active:text-white">Resend OTP</button> : null}<Link href="/influencer/login" className="mt-4 block text-center text-sm text-forest-green">Back to login</Link></form></main>;
}
