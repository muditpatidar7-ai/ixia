import type { Metadata } from "next";
import PlatformPage from "./platform/page";
import { canonicalUrl, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "iXIA Local Influencer Marketing Platform",
  description: "iXIA matches local creators with relevant businesses for authentic influencer marketing campaigns, paid partnerships, and repeat brand work.",
  alternates: { canonical: canonicalUrl("/") },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "iXIA",
  description: "iXIA connects local creators and influencers with relevant brand collaboration opportunities.",
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    addressLocality: "[City]",
    addressCountry: "[Country]",
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <PlatformPage />
    </>
  );
}
