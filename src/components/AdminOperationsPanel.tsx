"use client";

import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  title: string;
  brand_name: string;
  category: string;
  location: string;
  budget: string;
  deadline: string;
};

type EditRequest = {
  id: string;
  user_id: string;
  requested_changes: Record<string, unknown>;
  influencers?: { full_name: string; email: string };
};

type Application = {
  id: string;
  campaign_id: string;
  status: "applied" | "shortlisted" | "confirmed" | "completed";
  applied_at: string;
  influencers?: { full_name: string; email: string };
};

const emptyForm = { title: "", brand_name: "", category: "", location: "", budget: "", deadline: "", description: "" };

export function AdminOperationsPanel({ token }: { token: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    const [campaignResponse, requestResponse] = await Promise.all([
      fetch("/api/admin/campaigns", { headers }),
      fetch("/api/admin/edit-requests", { headers }),
    ]);
    const campaignsResult = await campaignResponse.json();
    const requestsResult = await requestResponse.json();
    setCampaigns(campaignsResult.campaigns ?? []);
    setRequests(requestsResult.editRequests ?? []);
  };

  useEffect(() => {
    if (token) void load();
  }, [token]);

  const selectCampaign = async (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    const response = await fetch("/api/admin/applications", { headers });
    const result = await response.json();
    setApplications((result.applications ?? []).filter((application: Application) => application.campaign_id === campaignId));
  };

  const createCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin/campaigns", { method: "POST", headers, body: JSON.stringify(form) });
    const result = await response.json();
    setMessage(result.error ?? "Campaign created.");
    if (response.ok) {
      setForm(emptyForm);
      void load();
    }
  };

  const removeCampaign = async (campaignId: string) => {
    await fetch(`/api/admin/campaigns/${campaignId}`, { method: "DELETE", headers });
    if (selectedCampaignId === campaignId) {
      setSelectedCampaignId("");
      setApplications([]);
    }
    void load();
  };

  const updateApplication = async (applicationId: string, status: Application["status"]) => {
    const response = await fetch("/api/admin/applications", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ id: applicationId, status }),
    });
    const result = await response.json();
    setMessage(result.error ?? "Application status updated.");
    if (response.ok && selectedCampaignId) void selectCampaign(selectedCampaignId);
  };

  const reviewRequest = async (id: string, decision: "approved" | "rejected") => {
    const response = await fetch("/api/admin/edit-requests", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ id, decision }),
    });
    const result = await response.json();
    setMessage(result.error ?? `Edit request ${decision}.`);
    void load();
  };

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-[28px] border border-forest-green/15 bg-white/85 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-forest-green">Campaign management</h2>
        <p className="mt-2 text-sm text-slate-600">Click a campaign to view the influencers who applied.</p>
        <form onSubmit={createCampaign} className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["title", "brand_name", "category", "location", "budget", "deadline"] as const).map((key) => (
            <input
              key={key}
              required
              type={key === "deadline" ? "date" : "text"}
              value={form[key]}
              onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              placeholder={key.replace("_", " ")}
              className="rounded-xl border p-3 text-sm"
            />
          ))}
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="min-h-20 rounded-xl border p-3 text-sm sm:col-span-2" />
          <button className="rounded-xl bg-terracotta px-4 py-3 font-semibold text-white sm:col-span-2">Create campaign</button>
        </form>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}

        <div className="mt-5 space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} onClick={() => void selectCampaign(campaign.id)} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm ${selectedCampaignId === campaign.id ? "border-terracotta bg-terracotta/10" : ""}`}>
              <span><b>{campaign.title}</b><br />{campaign.brand_name} · {campaign.location}<br /><span className="text-xs text-slate-500">Click to view applicants</span></span>
              <button type="button" onClick={(event) => { event.stopPropagation(); void removeCampaign(campaign.id); }} className="text-red-700">Delete</button>
            </div>
          ))}
        </div>

        {selectedCampaignId ? (
          <div className="mt-6 border-t border-forest-green/15 pt-5">
            <h3 className="text-lg font-semibold text-forest-green">Influencers who applied</h3>
            {applications.length ? (
              <div className="mt-3 space-y-3">
                {applications.map((application) => (
                  <div key={application.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm">
                    <span><b>{application.influencers?.full_name ?? "Influencer"}</b><br />{application.influencers?.email ?? "No email"}<br /><span className="text-xs text-slate-500">Applied {new Date(application.applied_at).toLocaleDateString()}</span></span>
                    <select value={application.status} onChange={(event) => void updateApplication(application.id, event.target.value as Application["status"])} className="rounded-lg border px-2 py-2">
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">No influencers have applied to this campaign yet.</p>}
          </div>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-forest-green/15 bg-white/85 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-forest-green">Monthly edit requests</h2>
        <p className="mt-2 text-sm text-slate-600">Influencers describe requested changes in plain language. Review and apply them during the monthly cycle.</p>
        <div className="mt-5 space-y-3">
          {requests.length ? requests.map((request) => (
            <div key={request.id} className="rounded-xl border p-3 text-sm">
              <b>{request.influencers?.full_name ?? request.user_id}</b>
              <p className="mt-1 whitespace-pre-wrap text-slate-600">{typeof request.requested_changes?.notes === "string" ? request.requested_changes.notes : "No written details provided."}</p>
              <div className="mt-3 flex gap-2"><button onClick={() => void reviewRequest(request.id, "approved")} className="rounded-lg bg-forest-green px-3 py-2 font-semibold text-white">Approve</button><button onClick={() => void reviewRequest(request.id, "rejected")} className="rounded-lg border border-red-300 px-3 py-2 font-semibold text-red-700">Reject</button></div>
            </div>
          )) : <p className="text-sm text-slate-500">No pending edit requests.</p>}
        </div>
      </div>
    </section>
  );
}
