"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

import {
  COLLABORATION_TYPES,
  CONTENT_LANGUAGE_OPTIONS,
  NICHE_OPTIONS,
  PRIMARY_PLATFORMS,
} from "@/lib/constants";
import type { FieldErrors, InfluencerFormValues } from "@/lib/types";
import { validateInfluencerPayload } from "@/lib/validation";

const initialValues: InfluencerFormValues = {
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

const getEighteenYearsAgo = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split("T")[0];
};

const toSubmissionPayload = (values: InfluencerFormValues) => ({
  ...values,
  hasPaidCollaborations:
    values.hasPaidCollaborations === "" ? "" : values.hasPaidCollaborations === "yes",
});

function OptionGrid({
  options,
  values,
  onToggle,
}: {
  options: readonly string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => (
        <label
          key={option}
          className="flex cursor-pointer items-center gap-3 rounded-[22px] border border-forest-green/20 bg-white/80 px-4 py-3 text-sm font-semibold text-forest-green transition has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/10"
        >
          <input
            type="checkbox"
            checked={values.includes(option)}
            onChange={() => onToggle(option)}
            className="h-4 w-4 accent-terracotta"
          />
          {option}
        </label>
      ))}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-700">{message}</p>;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-forest-green/20 py-10 first:border-t-0 first:pt-0">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div>
          <h2 className="text-lg font-semibold text-forest-green">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">{children}</div>
      </div>
    </section>
  );
}

export function RegistrationForm() {
  const [values, setValues] = useState<InfluencerFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const maxBirthDate = useMemo(() => getEighteenYearsAgo(), []);

  const setValue = <K extends keyof InfluencerFormValues>(key: K, value: InfluencerFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const toggleMultiValue = (key: "niches" | "contentLanguages" | "preferredCollaborationTypes", value: string) => {
    setValues((current) => {
      const currentValues = current[key];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...current, [key]: nextValues };
    });
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = toSubmissionPayload(values);
    const validation = validateInfluencerPayload(payload);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/influencers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors ?? { form: "Could not submit your registration." });
        return;
      }

      setIsSubmitted(true);
      setValues(initialValues);
    } catch {
      setErrors({ form: "Something went wrong while submitting. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-forest-green/20 bg-white/85 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest-green">Registration received</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Thanks for joining Ixia.</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          We have received your creator profile. A confirmation email has been sent when email delivery is configured, and the Ixia team will contact you directly by email soon.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setAcceptedTerms(false);
            }}
            className="rounded-[22px] border border-forest-green/30 px-5 py-3 text-sm font-semibold text-forest-green transition hover:border-forest-green"
          >
            Register another influencer
          </button>
          <Link
            href="/"
            className="rounded-[22px] bg-terracotta px-5 py-3 text-sm font-semibold text-white transition hover:bg-terracotta/90"
          >
            Back to Ixia
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-[18px] border border-forest-green/25 bg-white/85 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20";
  const labelClass = "block text-sm font-semibold text-slate-900";

  if (!acceptedTerms) {
    return (
      <div className="mx-auto max-w-5xl rounded-[34px] border border-forest-green/15 bg-white/85 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-blue">Important information before registration</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-forest-green sm:text-4xl">
            Influencer Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Please read the following terms carefully before joining the iXIA platform. Your acceptance is required before you can complete registration and be considered for local brand collaborations.
          </p>
        </div>

        <div className="rounded-[24px] border border-forest-green/15 bg-slate-50/80 p-5 text-sm leading-7 text-slate-700 shadow-inner sm:p-7">
          <ol className="list-decimal space-y-5 pl-5">
            <li>
              <strong>Introduction.</strong> These Terms &amp; Conditions govern any individual who registers, applies, or participates as an influencer on the iXIA platform. By registering, the influencer agrees to be bound by these terms and by any policies, updates, and verification requirements issued by iXIA from time to time.
            </li>
            <li>
              <strong>Accuracy of Information.</strong> All information provided during registration, including follower count, engagement metrics, niche, category, location, contact details, and account identifiers, must be true, accurate, and verifiable. iXIA may verify or re-verify this information at any stage during the influencer&apos;s participation on the platform. False or misleading information may result in immediate suspension or permanent blocking, in iXIA&apos;s sole discretion.
            </li>
            <li>
              <strong>Prohibition on Artificial Growth Methods.</strong> Influencers must not use third-party applications, bots, automation tools, purchased followers, engagement pods, fake comments, fake likes, or any other artificial means to inflate follower counts, views, engagement, or performance metrics. iXIA may use manual review and automated detection tools to identify such behaviour. A confirmed violation will result in immediate and permanent blocking from the platform, without prior warning.
            </li>
            <li>
              <strong>Verification Process.</strong> After registration, a member of the iXIA team may contact the influencer to schedule a verification call via Google Meet or a similar online video platform. During that call, the influencer may be required to demonstrate ownership and legitimacy of their social media account(s) through screen share or equivalent means. Failure to attend, or failure to reschedule within a reasonable time, may result in rejection or suspension of the application.
            </li>
            <li>
              <strong>Post-Verification Communication.</strong> All work, updates, assignments, collaboration details, and communication from iXIA will be sent to the influencer through the email address provided during registration. The influencer must monitor that email account closely, as all important information regarding work, instructions, and coordination will be shared there only.
            </li>
            <li>
              <strong>Consequences of Violations.</strong> Any violation of Sections 2 and/or 3 shall result in immediate blocking from the iXIA platform. iXIA&apos;s decision in such matters is final, subject only to the appeal process described in Section 7.
            </li>
            <li>
              <strong>Appeals.</strong> A blocked or rejected influencer may submit a written appeal by emailing <a href="mailto:ixia98971@gmail.com" className="text-forest-green underline">ixia98971@gmail.com</a> with their registered details and the reason they believe the decision should be revisited. iXIA is under no obligation to reverse any decision and submission of an appeal does not guarantee reinstatement.
            </li>
            <li>
              <strong>Eligibility Requirements.</strong> Influencers must be at least 18 years of age, maintain a public and active social media presence in good standing, and comply with the location and residency requirements relevant to local influencer matching. Accounts that are restricted, banned, or non-compliant with platform rules may be rejected.
            </li>
            <li>
              <strong>Data &amp; Privacy.</strong> iXIA may collect and process personal information such as contact details, social media handles, profile information, verification call records where applicable, and other registration data to match influencers with local businesses, conduct verification, and manage platform operations. This data will not be sold to unrelated third parties. A separate Privacy Policy governs the full details of data use and retention.
            </li>
            <li>
              <strong>Code of Conduct.</strong> Influencers are expected to act professionally when engaging with brands introduced by iXIA, meet agreed deliverables and deadlines, and refrain from artificial engagement methods on sponsored or branded content as well as organic content.
            </li>
            <li>
              <strong>Right to Modify Terms.</strong> iXIA reserves the right to amend these terms at any time. Continued use of the platform after such changes are posted constitutes acceptance of the revised terms.
            </li>
            <li>
              <strong>Governing Law.</strong> These Terms shall be governed by and construed in accordance with the laws of [jurisdiction to be inserted], without regard to conflict of law principles.
            </li>
          </ol>
        </div>

        <div className="mt-8 rounded-[22px] border border-forest-green/20 bg-white/80 p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 accent-terracotta"
            />
            <span>
              I have read, understood, and agree to be bound by these Terms &amp; Conditions in full. I understand that false information, artificial engagement methods, or failure to comply with verification requirements may result in immediate suspension or permanent blocking from the iXIA platform.
            </span>
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="rounded-[22px] border border-forest-green/30 px-5 py-3 text-center text-sm font-semibold text-forest-green transition hover:border-forest-green"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => setAcceptedTerms(true)}
              disabled={!acceptedTerms}
              className="rounded-[22px] bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Continue to registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl rounded-[34px] bg-white/80 px-5 py-10 shadow-sm ring-1 ring-forest-green/15 sm:px-8 lg:px-10">
      {errors.form ? (
        <div className="mb-8 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errors.form}</div>
      ) : null}

      <Section title="Basic details" description="Tell Ixia who you are and where you are based.">
        <label className={labelClass}>
          Full name
          <input
            required
            value={values.fullName}
            onChange={(event) => setValue("fullName", event.target.value)}
            className={inputClass}
            placeholder="Aarav Sharma"
          />
          <FieldError message={errors.fullName} />
        </label>

        <label className={labelClass}>
          Email
          <input
            required
            type="email"
            value={values.email}
            onChange={(event) => setValue("email", event.target.value)}
            className={inputClass}
            placeholder="creator@example.com"
          />
          <FieldError message={errors.email} />
        </label>

        <label className={labelClass}>
          Phone number
          <input
            required
            type="tel"
            value={values.phone}
            onChange={(event) => setValue("phone", event.target.value)}
            className={inputClass}
            placeholder="+91 98765 43210"
          />
          <FieldError message={errors.phone} />
        </label>

        <label className={labelClass}>
          Date of birth
          <input
            required
            type="date"
            max={maxBirthDate}
            value={values.dateOfBirth}
            onChange={(event) => setValue("dateOfBirth", event.target.value)}
            className={inputClass}
          />
          <FieldError message={errors.dateOfBirth} />
        </label>

        <label className={labelClass}>
          City
          <input
            required
            value={values.city}
            onChange={(event) => setValue("city", event.target.value)}
            className={inputClass}
            placeholder="Mumbai"
          />
          <FieldError message={errors.city} />
        </label>

        <label className={labelClass}>
          State
          <input
            required
            value={values.state}
            onChange={(event) => setValue("state", event.target.value)}
            className={inputClass}
            placeholder="Maharashtra"
          />
          <FieldError message={errors.state} />
        </label>

        <label className={labelClass}>
          Locality
          <input
            required
            value={values.locality}
            onChange={(event) => setValue("locality", event.target.value)}
            className={inputClass}
            placeholder="Bandra West"
          />
          <FieldError message={errors.locality} />
        </label>
      </Section>

      <Section title="Social media" description="Share your strongest channel and audience size.">
        <label className={labelClass}>
          Primary platform
          <select
            required
            value={values.primaryPlatform}
            onChange={(event) => setValue("primaryPlatform", event.target.value as InfluencerFormValues["primaryPlatform"])}
            className={inputClass}
          >
            <option value="">Select platform</option>
            {PRIMARY_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <FieldError message={errors.primaryPlatform} />
        </label>

        <label className={labelClass}>
          Follower/subscriber count
          <input
            required
            type="number"
            min="0"
            step="1"
            value={values.followerCount}
            onChange={(event) => setValue("followerCount", event.target.value)}
            className={inputClass}
            placeholder="25000"
          />
          <FieldError message={errors.followerCount} />
        </label>

        <label className={labelClass}>
          Instagram handle
          <input
            value={values.instagramHandle}
            onChange={(event) => setValue("instagramHandle", event.target.value)}
            className={inputClass}
            placeholder="@ixia.creator"
          />
          <FieldError message={errors.instagramHandle} />
        </label>

        <label className={labelClass}>
          YouTube channel link
          <input
            type="url"
            value={values.youtubeChannelLink}
            onChange={(event) => setValue("youtubeChannelLink", event.target.value)}
            className={inputClass}
            placeholder="https://youtube.com/@creator"
          />
          <FieldError message={errors.youtubeChannelLink} />
        </label>

        <label className={labelClass}>
          Average reel views
          <input
            type="text"
            inputMode="decimal"
            value={values.engagementRate}
            onChange={(event) => setValue("engagementRate", event.target.value)}
            className={inputClass}
            placeholder="45000"
          />
          <FieldError message={errors.engagementRate} />
        </label>
      </Section>

      <Section title="Content" description="Help the team match you with the right campaigns.">
        <div className={`${labelClass} sm:col-span-2`}>
          Niche/category
          <OptionGrid
            options={NICHE_OPTIONS}
            values={values.niches}
            onToggle={(value) => toggleMultiValue("niches", value)}
          />
          <FieldError message={errors.niches} />
        </div>

        {values.niches.includes("Other") ? (
          <label className={`${labelClass} sm:col-span-2`}>
            Write your other niche
            <input
              value={values.otherNiche}
              onChange={(event) => setValue("otherNiche", event.target.value)}
              className={inputClass}
              placeholder="Sustainable travel, parenting, finance..."
            />
            <FieldError message={errors.otherNiche} />
          </label>
        ) : null}

        <div className={`${labelClass} sm:col-span-2`}>
          Content language
          <OptionGrid
            options={CONTENT_LANGUAGE_OPTIONS}
            values={values.contentLanguages}
            onToggle={(value) => toggleMultiValue("contentLanguages", value)}
          />
          <FieldError message={errors.contentLanguages} />
        </div>

        {values.contentLanguages.includes("Other") ? (
          <label className={`${labelClass} sm:col-span-2`}>
            Write your other language
            <input
              value={values.otherContentLanguage}
              onChange={(event) => setValue("otherContentLanguage", event.target.value)}
              className={inputClass}
              placeholder="Tamil, Marathi, Bengali..."
            />
            <FieldError message={errors.otherContentLanguage} />
          </label>
        ) : null}
      </Section>

      <Section title="Collaboration" description="Set collaboration preferences and optional commercial context.">
        <fieldset className="sm:col-span-2">
          <legend className={labelClass}>Have you done paid collaborations before?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              ["yes", "Yes"],
              ["no", "No"],
            ].map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-3 rounded-[22px] border border-forest-green/20 bg-white/80 px-4 py-3 text-sm font-semibold text-forest-green transition has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/10"
              >
                <input
                  required
                  type="radio"
                  name="hasPaidCollaborations"
                  value={value}
                  checked={values.hasPaidCollaborations === value}
                  onChange={() => setValue("hasPaidCollaborations", value as "yes" | "no")}
                  className="h-4 w-4 accent-terracotta"
                />
                {label}
              </label>
            ))}
          </div>
          <FieldError message={errors.hasPaidCollaborations} />
        </fieldset>

        <fieldset className="sm:col-span-2">
          <legend className={labelClass}>Preferred collaboration type</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {COLLABORATION_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-3 rounded-[22px] border border-forest-green/20 bg-white/80 px-4 py-3 text-sm font-semibold text-forest-green transition has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/10"
              >
                <input
                  type="checkbox"
                  checked={values.preferredCollaborationTypes.includes(type)}
                  onChange={() => toggleMultiValue("preferredCollaborationTypes", type)}
                  className="h-4 w-4 accent-terracotta"
                />
                {type}
              </label>
            ))}
          </div>
          <FieldError message={errors.preferredCollaborationTypes} />
        </fieldset>

        <label className={labelClass}>
          Charges per reel / post
          <span className="ml-2 text-xs font-medium text-slate-500">Optional</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.expectedRate}
            onChange={(event) => setValue("expectedRate", event.target.value)}
            className={inputClass}
            placeholder="15000"
          />
          <FieldError message={errors.expectedRate} />
        </label>
      </Section>

      <Section title="Extra" description="Add links or notes that help Ixia understand your work.">
        <label className={`${labelClass} sm:col-span-2`}>
          Instagram account link
          <input
            required
            type="url"
            value={values.portfolioLink}
            onChange={(event) => setValue("portfolioLink", event.target.value)}
            className={inputClass}
            placeholder="https://instagram.com/yourhandle"
          />
          <FieldError message={errors.portfolioLink} />
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          Additional notes/message
          <span className="ml-2 text-xs font-medium text-slate-500">Optional</span>
          <textarea
            value={values.additionalNotes}
            onChange={(event) => setValue("additionalNotes", event.target.value)}
            className={`${inputClass} min-h-36 resize-y`}
            placeholder="Share campaign preferences, audience context, or anything else Ixia should know."
          />
          <FieldError message={errors.additionalNotes} />
        </label>
      </Section>

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-forest-green/20 pt-8 sm:flex-row sm:items-center">
        <Link href="/" className="rounded-[22px] border border-forest-green/30 px-5 py-3 text-center text-sm font-semibold text-forest-green transition hover:border-forest-green">
          Back to home
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[22px] bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Submitting..." : "Submit registration"}
        </button>
      </div>
    </form>
  );
}
