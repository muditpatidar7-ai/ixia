"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = { id: string; title: string; brand_name: string; category: string; location: string; budget: string; deadline: string; description: string; applications?: { user_id: string; status: string }[] };
type Profile = { id: string; full_name: string; email: string; city: string; niches: string[]; instagram_handle: string | null; youtube_channel_link: string | null; follower_count: number; is_admin_verified: boolean; last_updated_at: string };

export function InfluencerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [message, setMessage] = useState("");
  const [editText, setEditText] = useState("");

  const load = async () => {
    const response = await fetch("/api/influencer/dashboard");
    if (response.status === 401 || response.status === 403) { router.replace("/influencer/login"); return; }
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Could not load dashboard."); return; }
    setProfile(result.profile); setCampaigns(result.campaigns ?? []);
  };
  useEffect(() => { void load(); }, []);

  const apply = async (campaignId: string) => {
    const response = await fetch("/api/influencer/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId }) });
    const result = await response.json(); setMessage(result.error ?? "Application submitted."); if (response.ok) void load();
  };
  const requestEdit = async () => {
    if (!editText.trim()) { setMessage("Please describe what you want to edit."); return; }
    const response = await fetch("/api/influencer/edit-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestedChanges: { notes: editText.trim() } }) });
    const result = await response.json(); setMessage(result.error ?? "Edit request submitted for the next monthly review.");
    if (response.ok) setEditText("");
  };

  if (!profile) return <main className="min-h-screen bg-cloud-gray p-8">{message || "Loading dashboard..."}</main>;
  return <main className="min-h-screen bg-cloud-gray px-5 py-10 sm:px-8"><div className="mx-auto max-w-6xl space-y-8">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-blue">Influencer dashboard</p><h1 className="mt-2 text-4xl font-semibold text-forest-green">Welcome, {profile.full_name}</h1></div><span className={`rounded-full px-4 py-2 text-sm font-semibold ${profile.is_admin_verified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{profile.is_admin_verified ? "Verified" : "Pending Verification"}</span></header>
    {message ? <p className="rounded-xl bg-white p-4 text-sm text-slate-700">{message}</p> : null}
    <section><h2 className="mb-4 text-2xl font-semibold text-forest-green">Campaigns</h2><div className="grid gap-5 md:grid-cols-2">{campaigns.length ? campaigns.map((campaign) => { const application = campaign.applications?.find((item) => item.user_id === profile.id); return <article key={campaign.id} className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-widest text-steel-blue">{campaign.category}</p><h3 className="mt-2 text-xl font-semibold text-slate-950">{campaign.title}</h3><p className="mt-2 text-sm text-slate-600">{campaign.brand_name} · {campaign.location}</p><p className="mt-3 text-sm leading-6 text-slate-700">{campaign.description}</p><div className="mt-4 flex justify-between text-sm font-semibold"><span>{campaign.budget}</span><span>Deadline: {campaign.deadline}</span></div><button disabled={Boolean(application)} onClick={() => void apply(campaign.id)} className="mt-5 w-full rounded-xl bg-terracotta px-4 py-3 font-semibold text-white disabled:bg-slate-400">{application ? application.status : "Apply Now"}</button></article>; }) : <p className="text-slate-600">No campaigns available yet.</p>}</div></section>
    <section className="rounded-3xl bg-white p-6"><h2 className="text-2xl font-semibold text-forest-green">Profile</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><p><b>Name:</b> {profile.full_name}</p><p><b>Email:</b> {profile.email}</p><p><b>Location:</b> {profile.city}</p><p><b>Niche:</b> {profile.niches?.join(", ") || "-"}</p><p><b>Followers:</b> {profile.follower_count}</p><p><b>Last approved update:</b> {new Date(profile.last_updated_at).toLocaleDateString()}</p></div><p className="mt-5 text-sm text-slate-600">Tell the admin what you want to change. The admin team will update your profile after review during the monthly cycle.</p><textarea value={editText} onChange={(event) => setEditText(event.target.value)} className="mt-4 min-h-24 w-full rounded-xl border p-3" placeholder="Write what you want to edit, for example: Please update my follower count to 12,000 and add my new Instagram link." /><button onClick={() => void requestEdit()} className="mt-3 rounded-xl bg-forest-green px-5 py-3 font-semibold text-white">Submit Edit Request</button></section>
  </div></main>;
}
