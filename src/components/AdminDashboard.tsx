"use client";

import type { HTMLAttributes } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  COLLABORATION_TYPES,
  CONTENT_LANGUAGE_OPTIONS,
  NICHE_OPTIONS,
  PRIMARY_PLATFORMS,
} from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { EngagementRateScale, FieldErrors, InfluencerFormValues, InfluencerRecord } from "@/lib/types";
import { validateInfluencerPayload } from "@/lib/validation";

const engagementRateScaleOptions: { value: EngagementRateScale; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "thousand", label: "Thousand" },
  { value: "million", label: "Million" },
];

type SortKey = "created_at" | "full_name" | "primary_platform" | "follower_count" | "city";
type SortDirection = "asc" | "desc";

const emptyFormValues: InfluencerFormValues = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  locality: "",
  dateOfBirth: "",
  primaryPlatform: "",
  instagramHandle: "",
  youtubeChannelLink: "",
  followerCount: "",
  engagementRate: "",
  engagementRateScale: "normal",
  barterAccepted: "",
  niches: [],
  otherNiche: "",
  contentLanguages: [],
  otherContentLanguage: "",
  hasPaidCollaborations: "",
  preferredCollaborationTypes: [],
  expectedRate: "",
  portfolioLink: "",
  additionalNotes: "",
};

const getEngagementRateScale = (value: number | null): EngagementRateScale => {
  if (!value || value < 1000) {
    return "normal";
  }

  if (value >= 1000000) {
    return "million";
  }

  return "thousand";
};

const formatEngagementRateForScale = (value: number | null, scale: EngagementRateScale) => {
  if (value === null || value === undefined) {
    return "";
  }

  const divisor = scale === "thousand" ? 1000 : scale === "million" ? 1000000 : 1;
  const formatted = value / divisor;
  return Number.isInteger(formatted) ? String(formatted) : formatted.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

const recordToFormValues = (record: InfluencerRecord): InfluencerFormValues => {
  const rawEngagementRate = record.engagement_rate;
  const scale = getEngagementRateScale(rawEngagementRate);

  return {
    fullName: record.full_name,
    email: record.email,
    phone: record.phone,
    city: record.city,
    state: record.state,
    locality: record.locality ?? "",
    dateOfBirth: record.date_of_birth,
    primaryPlatform: record.primary_platform,
    instagramHandle: record.instagram_handle ?? "",
    youtubeChannelLink: record.youtube_channel_link ?? "",
    followerCount: String(record.follower_count ?? ""),
    engagementRate: formatEngagementRateForScale(rawEngagementRate, scale),
    engagementRateScale: scale,
    barterAccepted: record.barter_accepted ? "yes" : "no",
    niches: record.niches ?? [],
    otherNiche: record.other_niche ?? "",
    contentLanguages: record.content_languages ?? [],
    otherContentLanguage: record.other_content_language ?? "",
    hasPaidCollaborations: record.has_paid_collabs ? "yes" : "no",
    preferredCollaborationTypes: record.preferred_collab_types ?? [],
    expectedRate: record.expected_rate === null ? "" : String(record.expected_rate),
    portfolioLink: record.portfolio_link ?? "",
    additionalNotes: record.additional_notes ?? "",
  };
};

const toSubmissionPayload = (values: InfluencerFormValues) => {
  const multiplier =
    values.engagementRateScale === "thousand" ? 1000 : values.engagementRateScale === "million" ? 1000000 : 1;
  const rawEngagementRate = values.engagementRate.trim();

  return {
    ...values,
    engagementRate:
      rawEngagementRate === "" ? "" : String(Math.round(Number(rawEngagementRate) * multiplier)),
    hasPaidCollaborations:
      values.hasPaidCollaborations === "" ? "" : values.hasPaidCollaborations === "yes",
  };
};

const formatList = (values?: string[] | null) => (values?.length ? values.join(", ") : "-");
const formatOptional = (value?: string | number | null) => (value === null || value === undefined || value === "" ? "-" : value);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-700">{message}</p>;
}

function TextInput({
  label,
  value,
  error,
  type = "text",
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-900">
      {label}
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[16px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
      />
      <FieldError message={error} />
    </label>
  );
}

function MultiSelect({
  label,
  values,
  options,
  error,
  onChange,
}: {
  label: string;
  values: string[];
  options: readonly string[];
  error?: string;
  onChange: (values: string[]) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-900">
      {label}
      <select
        multiple
        value={values}
        onChange={(event) =>
          onChange(
            Array.from(event.target.options)
              .filter((option) => option.selected)
              .map((option) => option.value),
          )
        }
        className="mt-2 min-h-32 w-full rounded-[18px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [accessToken, setAccessToken] = useState("");
  const [influencers, setInfluencers] = useState<InfluencerRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [editValues, setEditValues] = useState<InfluencerFormValues>(emptyFormValues);
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [selectedForEmail, setSelectedForEmail] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = useState(() => Boolean(supabase));
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(() =>
    supabase ? "" : "Supabase public environment variables are not configured yet.",
  );
  const [bulkMessage, setBulkMessage] = useState("");

  const loadInfluencers = useCallback(async (token: string) => {
    if (!supabase) {
      setStatusMessage("Supabase public environment variables are not configured yet.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setStatusMessage("");

    const response = await fetch("/api/admin/influencers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      router.replace("/admin/login");
      return;
    }

    const result = await response.json();
    if (!response.ok) {
      setStatusMessage(result.error ?? "Could not load influencers.");
      setIsLoading(false);
      return;
    }

    const loadedInfluencers = (result.influencers ?? []) as InfluencerRecord[];
    const firstInfluencer = loadedInfluencers[0] ?? null;
    setInfluencers(loadedInfluencers);
    setSelectedId(firstInfluencer?.id ?? "");
    setEditValues(firstInfluencer ? recordToFormValues(firstInfluencer) : emptyFormValues);
    setEditErrors({});
    setIsLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }

      setAccessToken(data.session.access_token);
      loadInfluencers(data.session.access_token);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setAccessToken(session.access_token);
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadInfluencers, router, supabase]);

  const filteredInfluencers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const location = locationFilter.trim().toLowerCase();

    return influencers
      .filter((influencer) => {
        const matchesPlatform = platformFilter === "all" || influencer.primary_platform === platformFilter;
        const matchesNiche = nicheFilter === "all" || influencer.niches?.includes(nicheFilter);
        const matchesLocation =
          !location ||
          influencer.city.toLowerCase().includes(location) ||
          influencer.state.toLowerCase().includes(location) ||
          (influencer.locality ?? "").toLowerCase().includes(location);
        const matchesSearch =
          !query ||
          [
            influencer.full_name,
            influencer.email,
            influencer.phone,
            influencer.city,
            influencer.state,
            influencer.locality,
            influencer.primary_platform,
            influencer.instagram_handle,
            influencer.youtube_channel_link,
            influencer.niches?.join(" "),
            influencer.other_niche,
            influencer.content_languages?.join(" "),
            influencer.other_content_language,
            influencer.preferred_collab_types?.join(" "),
            influencer.additional_notes,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);

        return matchesPlatform && matchesNiche && matchesLocation && matchesSearch;
      })
      .sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        const comparison = String(aValue).localeCompare(String(bValue));
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [influencers, locationFilter, nicheFilter, platformFilter, search, sortDirection, sortKey]);

  const selectedInfluencer = useMemo(
    () => influencers.find((influencer) => influencer.id === selectedId) ?? null,
    [influencers, selectedId],
  );

  const setEditValue = <K extends keyof InfluencerFormValues>(key: K, value: InfluencerFormValues[K]) => {
    setEditValues((current) => ({ ...current, [key]: value }));
    setEditErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const toggleEmailSelection = (id: string) => {
    setSelectedForEmail((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedForEmail(new Set(filteredInfluencers.map((influencer) => influencer.id)));
  };

  const clearEmailSelection = () => {
    setSelectedForEmail(new Set());
  };

  const saveInfluencer = async () => {
    if (!selectedId || !accessToken) {
      return;
    }

    const payload = toSubmissionPayload(editValues);
    const validation = validateInfluencerPayload(payload);

    if (!validation.ok) {
      setEditErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    const response = await fetch(`/api/admin/influencers/${selectedId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setEditErrors(result.errors ?? { form: "Could not save influencer." });
      return;
    }

    setInfluencers((current) =>
      current.map((influencer) => (influencer.id === selectedId ? result.influencer : influencer)),
    );
    setStatusMessage("Influencer updated.");
  };

  const deleteInfluencer = async () => {
    if (!selectedId || !accessToken || !selectedInfluencer) {
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedInfluencer.full_name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/influencers/${selectedId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      setStatusMessage("Could not delete influencer.");
      return;
    }

    setInfluencers((current) => current.filter((influencer) => influencer.id !== selectedId));
    setSelectedForEmail((current) => {
      const next = new Set(current);
      next.delete(selectedId);
      return next;
    });
    setSelectedId("");
    setStatusMessage("Influencer deleted.");
  };

  const sendBulkEmailPlaceholder = async (sendAll = false) => {
    if (!accessToken) {
      return;
    }

    const influencerIds = sendAll ? influencers.map((influencer) => influencer.id) : Array.from(selectedForEmail);

    const response = await fetch("/api/admin/email/bulk", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ influencerIds }),
    });

    const result = await response.json();
    setBulkMessage(result.message ?? "Bulk email route is ready for implementation.");
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <main className="min-h-screen bg-cloud-gray">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-forest-green/25 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-blue">Ixia admin</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forest-green sm:text-4xl">
              Influencer dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Search, sort, update, and prepare outreach lists from creator registrations.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => loadInfluencers(accessToken)}
              className="rounded-[20px] border border-forest-green/25 bg-white/80 px-4 py-2.5 text-sm font-semibold text-forest-green transition hover:border-forest-green"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={signOut}
              className="rounded-[20px] bg-terracotta px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-terracotta/90"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-3 border-b border-forest-green/25 py-5 lg:grid-cols-[1.3fr_180px_180px_240px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-[18px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
            placeholder="Search name, email, handle, niche, notes"
          />
          <select
            value={platformFilter}
            onChange={(event) => setPlatformFilter(event.target.value)}
            className="rounded-[18px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
          >
            <option value="all">All platforms</option>
            {PRIMARY_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <select
            value={nicheFilter}
            onChange={(event) => setNicheFilter(event.target.value)}
            className="rounded-[18px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
          >
            <option value="all">All niches</option>
            {NICHE_OPTIONS.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
          <input
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            className="rounded-[18px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
            placeholder="Filter locality, city, or state"
          />
        </section>

        <section className="grid gap-4 border-b border-forest-green/25 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-base font-semibold text-forest-green">Bulk email placeholder</h2>
            <p className="mt-1 text-sm text-slate-600">
              {selectedForEmail.size} selected. The route and future campaign tables are scaffolded for one-click outreach.
            </p>
            {bulkMessage ? <p className="mt-2 text-sm font-medium text-amber-800">{bulkMessage}</p> : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-4 lg:w-[620px]">
            <button type="button" onClick={selectAllVisible} className="rounded-[18px] border border-forest-green/25 bg-white/80 px-3 py-2 text-sm font-semibold text-forest-green transition hover:border-forest-green">
              Select visible
            </button>
            <button type="button" onClick={clearEmailSelection} className="rounded-[18px] border border-forest-green/25 bg-white/80 px-3 py-2 text-sm font-semibold text-forest-green transition hover:border-forest-green">
              Clear
            </button>
            <button type="button" onClick={() => sendBulkEmailPlaceholder(false)} className="rounded-[18px] bg-terracotta px-3 py-2 text-sm font-semibold text-white transition hover:bg-terracotta/90">
              Send selected
            </button>
            <button type="button" onClick={() => sendBulkEmailPlaceholder(true)} className="rounded-[18px] bg-forest-green px-3 py-2 text-sm font-semibold text-white transition hover:bg-forest-green/90">
              Send all
            </button>
          </div>
        </section>

        {statusMessage ? <div className="mt-5 rounded-[18px] border border-steel-blue/25 bg-white/75 px-4 py-3 text-sm text-forest-green">{statusMessage}</div> : null}

        <section className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.55fr)]">
          <div className="overflow-hidden rounded-[28px] border border-forest-green/15 bg-white/85 shadow-sm">
            <div className="flex items-center justify-between border-b border-forest-green/15 px-4 py-3">
              <p className="text-sm font-semibold text-forest-green">
                {filteredInfluencers.length} of {influencers.length} influencers
              </p>
              <select
                value={`${sortKey}:${sortDirection}`}
                onChange={(event) => {
                  const [key, direction] = event.target.value.split(":") as [SortKey, SortDirection];
                  setSortKey(key);
                  setSortDirection(direction);
                }}
                className="rounded-[18px] border border-forest-green/25 bg-white px-3 py-2 text-sm outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              >
                <option value="created_at:desc">Newest first</option>
                <option value="created_at:asc">Oldest first</option>
                <option value="full_name:asc">Name A-Z</option>
                <option value="full_name:desc">Name Z-A</option>
                <option value="follower_count:desc">Largest audience</option>
                <option value="follower_count:asc">Smallest audience</option>
              </select>
            </div>

            <div className="max-h-[720px] overflow-auto">
              <table className="min-w-[2150px] divide-y divide-forest-green/15 text-left text-sm">
                <thead className="sticky top-0 bg-steel-blue text-xs uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">
                      <button type="button" onClick={() => setSort("full_name")} className="font-semibold">
                        Full name
                      </button>
                    </th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">
                      <button type="button" onClick={() => setSort("city")} className="font-semibold">
                        Location
                      </button>
                    </th>
                    <th className="px-3 py-3">Locality</th>
                    <th className="px-3 py-3">Date of birth</th>
                    <th className="px-3 py-3">
                      <button type="button" onClick={() => setSort("primary_platform")} className="font-semibold">
                        Platform
                      </button>
                    </th>
                    <th className="px-3 py-3">Instagram</th>
                    <th className="px-3 py-3">YouTube</th>
                    <th className="px-3 py-3">
                      <button type="button" onClick={() => setSort("follower_count")} className="font-semibold">
                        Followers
                      </button>
                    </th>
                        <th className="px-3 py-3">Average reel views</th>
                    <th className="px-3 py-3">Niches</th>
                    <th className="px-3 py-3">Other niche</th>
                    <th className="px-3 py-3">Languages</th>
                    <th className="px-3 py-3">Other language</th>
                    <th className="px-3 py-3">Paid collabs</th>
                    <th className="px-3 py-3">Collab types</th>
                    <th className="px-3 py-3">Rate</th>
                    <th className="px-3 py-3">Portfolio</th>
                    <th className="px-3 py-3">Notes</th>
                    <th className="px-3 py-3">Email status</th>
                    <th className="px-3 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-green/10 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={22} className="px-4 py-12 text-center text-slate-500">
                        Loading influencers...
                      </td>
                    </tr>
                  ) : filteredInfluencers.length === 0 ? (
                    <tr>
                      <td colSpan={22} className="px-4 py-12 text-center text-slate-500">
                        No influencers match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredInfluencers.map((influencer) => (
                      <tr
                        key={influencer.id}
                        onClick={() => {
                          setSelectedId(influencer.id);
                          setEditValues(recordToFormValues(influencer));
                          setEditErrors({});
                        }}
                        className={`cursor-pointer transition hover:bg-terracotta/10 ${
                          influencer.id === selectedId ? "bg-terracotta/10" : ""
                        }`}
                      >
                        <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedForEmail.has(influencer.id)}
                              onChange={() => toggleEmailSelection(influencer.id)}
                              className="h-4 w-4 accent-terracotta"
                            />
                            <span className="font-medium text-slate-950">{influencer.email}</span>
                          </label>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-950">{influencer.full_name}</td>
                        <td className="px-3 py-3 text-slate-700">{influencer.phone}</td>
                        <td className="px-3 py-3 text-slate-700">{influencer.city}, {influencer.state}</td>
                        <td className="px-3 py-3 text-slate-700">{influencer.locality}</td>
                        <td className="px-3 py-3 text-slate-700">{influencer.date_of_birth}</td>
                        <td className="px-3 py-3 text-slate-700">{influencer.primary_platform}</td>
                        <td className="px-3 py-3 text-slate-700">{formatOptional(influencer.instagram_handle)}</td>
                        <td className="max-w-[180px] truncate px-3 py-3 text-slate-700">{formatOptional(influencer.youtube_channel_link)}</td>
                        <td className="px-3 py-3 text-slate-700">{influencer.follower_count.toLocaleString()}</td>
                        <td className="px-3 py-3 text-slate-700">{formatOptional(influencer.engagement_rate)}</td>
                        <td className="max-w-[220px] px-3 py-3 text-slate-700">{formatList(influencer.niches)}</td>
                        <td className="max-w-[180px] truncate px-3 py-3 text-slate-700">{formatOptional(influencer.other_niche)}</td>
                        <td className="px-3 py-3 text-slate-700">{formatList(influencer.content_languages)}</td>
                        <td className="max-w-[180px] truncate px-3 py-3 text-slate-700">{formatOptional(influencer.other_content_language)}</td>
                        <td className="px-3 py-3 text-slate-700">{influencer.has_paid_collabs ? "Yes" : "No"}</td>
                        <td className="px-3 py-3 text-slate-700">{formatList(influencer.preferred_collab_types)}</td>
                        <td className="px-3 py-3 text-slate-700">{formatOptional(influencer.expected_rate)}</td>
                        <td className="max-w-[180px] truncate px-3 py-3 text-slate-700">{formatOptional(influencer.portfolio_link)}</td>
                        <td className="max-w-[220px] truncate px-3 py-3 text-slate-700">{formatOptional(influencer.additional_notes)}</td>
                        <td className="px-3 py-3 text-slate-700">{influencer.confirmation_email_status}</td>
                        <td className="px-3 py-3 text-slate-700">{formatDateTime(influencer.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-[28px] border border-forest-green/15 bg-white/85 p-5 shadow-sm">
            {selectedInfluencer ? (
              <>
                <div className="border-b border-forest-green/15 pb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-steel-blue">Selected creator</p>
                  <h2 className="mt-2 text-2xl font-semibold text-forest-green">{selectedInfluencer.full_name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{selectedInfluencer.email}</p>
                </div>

                {editErrors.form ? (
                  <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{editErrors.form}</div>
                ) : null}

                <div className="mt-5 grid gap-4">
                  <TextInput label="Full name" value={editValues.fullName} error={editErrors.fullName} onChange={(value) => setEditValue("fullName", value)} />
                  <TextInput label="Email" value={editValues.email} error={editErrors.email} type="email" onChange={(value) => setEditValue("email", value)} />
                  <TextInput label="Phone" value={editValues.phone} error={editErrors.phone} onChange={(value) => setEditValue("phone", value)} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="City" value={editValues.city} error={editErrors.city} onChange={(value) => setEditValue("city", value)} />
                    <TextInput label="State" value={editValues.state} error={editErrors.state} onChange={(value) => setEditValue("state", value)} />
                  </div>
                  <TextInput label="Locality" value={editValues.locality} error={editErrors.locality} onChange={(value) => setEditValue("locality", value)} />
                  <TextInput label="Date of birth" value={editValues.dateOfBirth} error={editErrors.dateOfBirth} type="date" onChange={(value) => setEditValue("dateOfBirth", value)} />
                  <label className="block text-sm font-semibold text-slate-900">
                    Primary platform
                    <select
                      value={editValues.primaryPlatform}
                      onChange={(event) => setEditValue("primaryPlatform", event.target.value as InfluencerFormValues["primaryPlatform"])}
                      className="mt-2 w-full rounded-[16px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                    >
                      {PRIMARY_PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                    <FieldError message={editErrors.primaryPlatform} />
                  </label>
                  <TextInput label="Instagram handle" value={editValues.instagramHandle} error={editErrors.instagramHandle} onChange={(value) => setEditValue("instagramHandle", value)} />
                  <TextInput label="YouTube channel link" value={editValues.youtubeChannelLink} error={editErrors.youtubeChannelLink} type="url" onChange={(value) => setEditValue("youtubeChannelLink", value)} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="Follower/subscriber count" value={editValues.followerCount} error={editErrors.followerCount} type="number" onChange={(value) => setEditValue("followerCount", value)} />
                    <div className="block text-sm font-semibold text-slate-900">
                      <span>Average reel views</span>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editValues.engagementRate}
                          onChange={(event) => setEditValue("engagementRate", event.target.value)}
                          className="w-full rounded-[16px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                        />
                        <select
                          value={editValues.engagementRateScale}
                          onChange={(event) =>
                            setEditValue("engagementRateScale", event.target.value as EngagementRateScale)
                          }
                          className="w-32 rounded-[16px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                        >
                          {engagementRateScaleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <FieldError message={editErrors.engagementRate} />
                    </div>
                  </div>
                  <MultiSelect label="Niches" values={editValues.niches} options={NICHE_OPTIONS} error={editErrors.niches} onChange={(values) => setEditValue("niches", values)} />
                  <TextInput label="Other niche" value={editValues.otherNiche} error={editErrors.otherNiche} onChange={(value) => setEditValue("otherNiche", value)} />
                  <MultiSelect label="Content languages" values={editValues.contentLanguages} options={CONTENT_LANGUAGE_OPTIONS} error={editErrors.contentLanguages} onChange={(values) => setEditValue("contentLanguages", values)} />
                  <TextInput label="Other content language" value={editValues.otherContentLanguage} error={editErrors.otherContentLanguage} onChange={(value) => setEditValue("otherContentLanguage", value)} />
                  <label className="block text-sm font-semibold text-slate-900">
                    Paid collaborations before?
                    <select
                      value={editValues.hasPaidCollaborations}
                      onChange={(event) => setEditValue("hasPaidCollaborations", event.target.value as "yes" | "no")}
                      className="mt-2 w-full rounded-[16px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <FieldError message={editErrors.hasPaidCollaborations} />
                  </label>
                  <label className="block text-sm font-semibold text-slate-900">
                    Barter accepted?
                    <select
                      value={editValues.barterAccepted}
                      onChange={(event) => setEditValue("barterAccepted", event.target.value as "yes" | "no")}
                      className="mt-2 w-full rounded-[16px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <FieldError message={editErrors.barterAccepted} />
                  </label>
                  <MultiSelect label="Preferred collaboration types" values={editValues.preferredCollaborationTypes} options={COLLABORATION_TYPES} error={editErrors.preferredCollaborationTypes} onChange={(values) => setEditValue("preferredCollaborationTypes", values)} />
                  <TextInput label="Expected rate per post/video" value={editValues.expectedRate} error={editErrors.expectedRate} type="number" onChange={(value) => setEditValue("expectedRate", value)} />
                  <TextInput label="Portfolio/media kit link" value={editValues.portfolioLink} error={editErrors.portfolioLink} type="url" onChange={(value) => setEditValue("portfolioLink", value)} />
                  <label className="block text-sm font-semibold text-slate-900">
                    Additional notes/message
                    <textarea
                      value={editValues.additionalNotes}
                      onChange={(event) => setEditValue("additionalNotes", event.target.value)}
                      className="mt-2 min-h-28 w-full rounded-[18px] border border-forest-green/25 bg-white/85 px-3 py-2.5 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                    />
                    <FieldError message={editErrors.additionalNotes} />
                  </label>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={saveInfluencer}
                    disabled={isSaving}
                    className="rounded-[20px] bg-terracotta px-4 py-3 text-sm font-semibold text-white transition hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={deleteInfluencer}
                    className="rounded-[20px] border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 transition hover:border-red-600 hover:bg-red-50"
                  >
                    Delete influencer
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-sm text-slate-500">Select an influencer to view and edit details.</div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
