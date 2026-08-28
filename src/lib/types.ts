import type {
  COLLABORATION_TYPES,
  CONTENT_LANGUAGE_OPTIONS,
  NICHE_OPTIONS,
  PRIMARY_PLATFORMS,
} from "./constants";

export type PrimaryPlatform = (typeof PRIMARY_PLATFORMS)[number];
export type Niche = (typeof NICHE_OPTIONS)[number];
export type ContentLanguage = (typeof CONTENT_LANGUAGE_OPTIONS)[number];
export type CollaborationType = (typeof COLLABORATION_TYPES)[number];
export type ConfirmationEmailStatus = "pending" | "sent" | "failed" | "skipped";

export type InfluencerFormValues = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  locality: string;
  dateOfBirth: string;
  primaryPlatform: PrimaryPlatform | "";
  instagramHandle: string;
  youtubeChannelLink: string;
  followerCount: string;
  engagementRate: string;
  barterAccepted: "yes" | "no" | "";
  niches: string[];
  otherNiche: string;
  contentLanguages: string[];
  otherContentLanguage: string;
  hasPaidCollaborations: "yes" | "no" | "";
  preferredCollaborationTypes: string[];
  expectedRate: string;
  portfolioLink: string;
  additionalNotes: string;
};

export type InfluencerInput = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  locality: string;
  dateOfBirth: string;
  primaryPlatform: PrimaryPlatform;
  instagramHandle: string | null;
  youtubeChannelLink: string | null;
  followerCount: number;
  engagementRate: number | null;
  barterAccepted: boolean;
  niches: string[];
  otherNiche: string | null;
  contentLanguages: string[];
  otherContentLanguage: string | null;
  hasPaidCollaborations: boolean;
  preferredCollaborationTypes: string[];
  expectedRate: number | null;
  portfolioLink: string | null;
  additionalNotes: string | null;
};

export type InfluencerRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  locality: string;
  date_of_birth: string;
  primary_platform: PrimaryPlatform;
  instagram_handle: string | null;
  youtube_channel_link: string | null;
  follower_count: number;
  engagement_rate: number | null;
  barter_accepted: boolean;
  niches: string[];
  other_niche: string | null;
  content_languages: string[];
  other_content_language: string | null;
  has_paid_collabs: boolean;
  preferred_collab_types: string[];
  expected_rate: number | null;
  portfolio_link: string | null;
  additional_notes: string | null;
  confirmation_email_status: ConfirmationEmailStatus;
  confirmation_email_sent_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FieldErrors = Partial<Record<keyof InfluencerFormValues | "form", string>>;
