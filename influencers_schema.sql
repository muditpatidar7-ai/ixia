
-- influencers_schema.sql
-- Supabase/Postgres schema for the Ixia creator-connect platform.
-- Run this in the Supabase SQL editor before deploying the Next.js app.

-- Required for gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'confirmation_email_status'
  ) THEN
    CREATE TYPE public.confirmation_email_status AS ENUM ('pending', 'sent', 'failed', 'skipped');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  locality text NOT NULL DEFAULT '',
  date_of_birth date NOT NULL,
  primary_platform text NOT NULL,
  instagram_handle text,
  youtube_channel_link text,
  follower_count integer NOT NULL DEFAULT 0,
  engagement_rate numeric(18,0),
  barter_accepted boolean NOT NULL DEFAULT false,
  niches text[] NOT NULL DEFAULT '{}',
  other_niche text,
  content_languages text[] NOT NULL DEFAULT '{}',
  other_content_language text,
  has_paid_collabs boolean DEFAULT false,
  preferred_collab_types text[] NOT NULL DEFAULT '{}',
  expected_rate numeric(12,2),
  portfolio_link text,
  additional_notes text,
  confirmation_email_status public.confirmation_email_status NOT NULL DEFAULT 'pending',
  confirmation_email_sent_at timestamptz,
  last_contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT influencers_email_unique UNIQUE (email),
  CONSTRAINT influencers_primary_platform_check CHECK (
    primary_platform IN ('Instagram', 'YouTube', 'Both', 'Other')
  ),
  CONSTRAINT influencers_follower_count_check CHECK (follower_count >= 0),
  CONSTRAINT influencers_engagement_rate_check CHECK (
    engagement_rate IS NULL OR engagement_rate >= 0
  ),
  CONSTRAINT influencers_expected_rate_check CHECK (
    expected_rate IS NULL OR expected_rate >= 0
  )
);

ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS locality text NOT NULL DEFAULT '';
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS youtube_channel_link text;
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS follower_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS barter_accepted boolean NOT NULL DEFAULT false;
ALTER TABLE public.influencers ALTER COLUMN engagement_rate TYPE numeric(18,0) USING engagement_rate::numeric(18,0);
ALTER TABLE public.influencers DROP CONSTRAINT IF EXISTS influencers_engagement_rate_check;
ALTER TABLE public.influencers ADD CONSTRAINT influencers_engagement_rate_check CHECK (
  engagement_rate IS NULL OR engagement_rate >= 0
);
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS other_niche text;
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS other_content_language text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'influencers'
      AND column_name = 'youtube_channel'
  ) THEN
    UPDATE public.influencers
    SET youtube_channel_link = COALESCE(youtube_channel_link, youtube_channel);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'influencers'
      AND column_name = 'followers_count'
  ) THEN
    UPDATE public.influencers
    SET follower_count = COALESCE(followers_count, follower_count, 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_influencers_primary_platform ON public.influencers (primary_platform);
CREATE INDEX IF NOT EXISTS idx_influencers_city_state ON public.influencers (city, state, locality);
CREATE INDEX IF NOT EXISTS idx_influencers_niches_gin ON public.influencers USING GIN (niches);
CREATE INDEX IF NOT EXISTS idx_influencers_languages_gin ON public.influencers USING GIN (content_languages);
CREATE INDEX IF NOT EXISTS idx_influencers_email ON public.influencers (email);
CREATE INDEX IF NOT EXISTS idx_influencers_created_at ON public.influencers (created_at DESC);

-- Future bulk email support. Campaign rows can later be created from the admin dashboard,
-- and recipients can be populated from public.influencers by email, niche, platform, or location.
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_campaign_recipients_unique UNIQUE (campaign_id, influencer_id)
);

CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign ON public.email_campaign_recipients (campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_email ON public.email_campaign_recipients (email);

-- Private Supabase Storage bucket reserved for future uploaded portfolio/media kit files.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'influencer-media-kits',
  'influencer-media-kits',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_update_influencers_updated_at ON public.influencers;
CREATE TRIGGER trg_update_influencers_updated_at
BEFORE UPDATE ON public.influencers
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- The Next.js API uses SUPABASE_SERVICE_ROLE_KEY for inserts and admin operations.
-- Keep public table policies closed unless you intentionally expose direct client access.
-- Admin access is checked in the application with Supabase Auth plus ADMIN_EMAILS.

-- End of schema.
--huhuhuhu

