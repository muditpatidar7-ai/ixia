# Ixia Creator Connect Platform

Ixia is a full-stack Next.js application for creator and influencer registration, Supabase-backed admin management, and future bulk outreach workflows.

## Stack

- Next.js App Router with React and Tailwind CSS
- Supabase PostgreSQL for influencer data
- Supabase Auth for admin login
- Supabase Storage bucket reserved for future media kit uploads
- Supabase service-role API routes for protected admin operations
- Resend or SendGrid-ready confirmation email delivery
- Vercel-ready project structure

## Pages

- `/` - responsive Ixia landing page with creator registration CTA
- `/register` - influencer registration form with client and server validation
- `/admin/login` - Supabase Auth email/password admin login
- `/admin/dashboard` - searchable, sortable admin dashboard with view/edit/delete and bulk email placeholder controls

## Design

The interface uses Ixia's earthy travel-inspired palette: cloud gray `#E8E8E4`, steel blue `#4A7BA6`, burnt terracotta `#B8724D`, and deep forest green `#2D5A3D`. Typography uses a grounded sans-serif stack with Inter/Poppins-style fallbacks.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run [influencers_schema.sql](./influencers_schema.sql) in the Supabase SQL editor.

3. In Supabase Auth, create an email/password user for each admin.

4. Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
EMAIL_PROVIDER=
EMAIL_FROM=
RESEND_API_KEY=
SENDGRID_API_KEY=
```

`ADMIN_EMAILS` should be a comma-separated list of the admin Supabase Auth emails. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and never expose it in client code.

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Email

The registration API sends a professional confirmation email through Resend or SendGrid when configured. If no provider is configured, registration still succeeds and `confirmation_email_status` is stored as `skipped`.

Future bulk email support is scaffolded in:

- `public.email_campaigns`
- `public.email_campaign_recipients`
- `/api/admin/email/bulk`
- Admin dashboard selection controls and send buttons

## Storage

The SQL creates a private `influencer-media-kits` Supabase Storage bucket for future portfolio/media kit uploads. The current form stores a portfolio/media kit URL, so no upload flow is required yet.

## Validation

Validation runs on the client before submission and again on the server before writing to Supabase. It checks required fields, locality, email format, phone format with country code, 18+ age, valid URLs, allowed dropdown values, keyboard-entered engagement rates such as `4.5` or `4.5%`, non-negative counts/rates, required multi-select choices, and custom text when `Other` is selected for niche or content language.

## Deployment

Deploy to Vercel and add the same environment variables from `.env.example` in the Vercel project settings. Run the Supabase SQL schema before testing registration or admin routes.
