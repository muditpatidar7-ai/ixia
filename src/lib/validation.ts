import {
  COLLABORATION_TYPES,
  CONTENT_LANGUAGE_OPTIONS,
  NICHE_OPTIONS,
  PRIMARY_PLATFORMS,
} from "./constants";
import type { FieldErrors, InfluencerInput } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;

type ValidationSuccess = {
  ok: true;
  data: InfluencerInput;
};

type ValidationFailure = {
  ok: false;
  errors: FieldErrors;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (source: Record<string, unknown>, key: string) =>
  typeof source[key] === "string" ? source[key].trim() : "";

const getOptionalString = (source: Record<string, unknown>, key: string) => {
  const value = getString(source, key);
  return value.length > 0 ? value : null;
};

const getStringArray = (source: Record<string, unknown>, key: string) =>
  Array.isArray(source[key])
    ? source[key].filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];

const isInOptions = <T extends readonly string[]>(value: string, options: T): value is T[number] =>
  options.includes(value);

const hasOnlyOptions = (values: string[], options: readonly string[]) =>
  values.length > 0 && values.every((value) => options.includes(value));

const parseRequiredNumber = (source: Record<string, unknown>, key: string) => {
  const raw = source[key];
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : null;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseOptionalNumber = (source: Record<string, unknown>, key: string) => {
  const raw = source[key];
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }

  if (typeof raw === "string" && raw.trim().endsWith("%")) {
    const parsed = Number(raw.trim().replace("%", ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return parseRequiredNumber(source, key);
};

const isValidUrl = (value: string | null) => {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isAtLeast18 = (dateString: string) => {
  const birthDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }

  const eighteenthBirthday = new Date(birthDate);
  eighteenthBirthday.setFullYear(birthDate.getFullYear() + 18);
  return eighteenthBirthday <= new Date();
};

const getPaidCollabValue = (source: Record<string, unknown>) => {
  const raw = source.hasPaidCollaborations;
  if (typeof raw === "boolean") {
    return raw;
  }
  if (raw === "yes") {
    return true;
  }
  if (raw === "no") {
    return false;
  }
  return null;
};

const getBarterAcceptedValue = (source: Record<string, unknown>) => {
  const raw = source.barterAccepted;
  if (typeof raw === "boolean") {
    return raw;
  }
  if (raw === "yes") {
    return true;
  }
  if (raw === "no") {
    return false;
  }
  return null;
};

export function validateInfluencerPayload(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, errors: { form: "Invalid request payload." } };
  }

  const fullName = getString(payload, "fullName");
  const email = getString(payload, "email").toLowerCase();
  const phone = getString(payload, "phone");
  const normalizedPhone = phone.replace(/[\s().-]/g, "");
  const city = getString(payload, "city");
  const state = getString(payload, "state");
  const locality = getString(payload, "locality");
  const dateOfBirth = getString(payload, "dateOfBirth");
  const primaryPlatform = getString(payload, "primaryPlatform");
  const instagramHandle = getOptionalString(payload, "instagramHandle");
  const youtubeChannelLink = getOptionalString(payload, "youtubeChannelLink");
  const followerCount = parseRequiredNumber(payload, "followerCount");
  const engagementRate = parseOptionalNumber(payload, "engagementRate");
  const barterAccepted = getBarterAcceptedValue(payload);
  const niches = getStringArray(payload, "niches");
  const otherNiche = getOptionalString(payload, "otherNiche");
  const contentLanguages = getStringArray(payload, "contentLanguages");
  const otherContentLanguage = getOptionalString(payload, "otherContentLanguage");
  const hasPaidCollaborations = getPaidCollabValue(payload);
  const preferredCollaborationTypes = getStringArray(payload, "preferredCollaborationTypes");
  const expectedRate = parseOptionalNumber(payload, "expectedRate");
  const portfolioLink = getOptionalString(payload, "portfolioLink");
  const additionalNotes = getOptionalString(payload, "additionalNotes");
  const errors: FieldErrors = {};

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!phone || !PHONE_PATTERN.test(normalizedPhone)) {
    errors.phone = "Enter a valid phone number with country code.";
  }

  if (!city) {
    errors.city = "City is required.";
  }

  if (!state) {
    errors.state = "State is required.";
  }

  if (!locality) {
    errors.locality = "Locality is required.";
  }

  if (!dateOfBirth || !isAtLeast18(dateOfBirth)) {
    errors.dateOfBirth = "Influencers must be at least 18 years old.";
  }

  if (!isInOptions(primaryPlatform, PRIMARY_PLATFORMS)) {
    errors.primaryPlatform = "Choose a primary platform.";
  }

  if (!isValidUrl(youtubeChannelLink)) {
    errors.youtubeChannelLink = "Enter a valid YouTube URL.";
  }

  if (followerCount === null || followerCount < 0 || !Number.isInteger(followerCount)) {
    errors.followerCount = "Enter a valid follower or subscriber count.";
  }

  if (engagementRate !== null && (engagementRate < 0 || !Number.isInteger(engagementRate))) {
    errors.engagementRate = "Average reel views must be a whole number of 0 or more.";
  }

  if (!hasOnlyOptions(niches, NICHE_OPTIONS)) {
    errors.niches = "Choose at least one valid niche.";
  }

  if (niches.includes("Other") && !otherNiche) {
    errors.otherNiche = "Write your other niche.";
  }

  if (!hasOnlyOptions(contentLanguages, CONTENT_LANGUAGE_OPTIONS)) {
    errors.contentLanguages = "Choose at least one valid content language.";
  }

  if (contentLanguages.includes("Other") && !otherContentLanguage) {
    errors.otherContentLanguage = "Write your other content language.";
  }

  if (hasPaidCollaborations === null) {
    errors.hasPaidCollaborations = "Choose yes or no.";
  }

  if (barterAccepted === null) {
    errors.barterAccepted = "Choose yes or no.";
  }

  if (!hasOnlyOptions(preferredCollaborationTypes, COLLABORATION_TYPES)) {
    errors.preferredCollaborationTypes = "Choose at least one collaboration type.";
  }

  if (expectedRate !== null && expectedRate < 0) {
    errors.expectedRate = "Expected rate cannot be negative.";
  }

  if (!portfolioLink || !isValidUrl(portfolioLink)) {
    errors.portfolioLink = "Enter a valid Instagram account link.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      fullName,
      email,
      phone: normalizedPhone.startsWith("+") ? normalizedPhone : `+${normalizedPhone}`,
      city,
      state,
      locality,
      dateOfBirth,
      primaryPlatform: primaryPlatform as InfluencerInput["primaryPlatform"],
      instagramHandle,
      youtubeChannelLink,
      followerCount: followerCount ?? 0,
      engagementRate,
      barterAccepted: barterAccepted ?? false,
      niches,
      otherNiche: niches.includes("Other") ? otherNiche : null,
      contentLanguages,
      otherContentLanguage: contentLanguages.includes("Other") ? otherContentLanguage : null,
      hasPaidCollaborations: hasPaidCollaborations ?? false,
      preferredCollaborationTypes,
      expectedRate,
      portfolioLink,
      additionalNotes,
    },
  };
}

export function toInfluencerDbPayload(data: InfluencerInput) {
  return {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    state: data.state,
    locality: data.locality,
    date_of_birth: data.dateOfBirth,
    primary_platform: data.primaryPlatform,
    instagram_handle: data.instagramHandle,
    youtube_channel_link: data.youtubeChannelLink,
    follower_count: data.followerCount,
    engagement_rate: data.engagementRate,
    barter_accepted: data.barterAccepted,
    niches: data.niches,
    other_niche: data.otherNiche,
    content_languages: data.contentLanguages,
    other_content_language: data.otherContentLanguage,
    has_paid_collabs: data.hasPaidCollaborations,
    preferred_collab_types: data.preferredCollaborationTypes,
    expected_rate: data.expectedRate,
    portfolio_link: data.portfolioLink,
    additional_notes: data.additionalNotes,
  };
}
