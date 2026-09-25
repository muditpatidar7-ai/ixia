export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ixiamedia.in";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "iXIA",
  url: siteUrl,
  logo: `${siteUrl}/ixia-creator-network.png`,
  description: "iXIA connects local creators and influencers with relevant brand collaboration opportunities.",
};

export function canonicalUrl(path: string) {
  return new URL(path, siteUrl).toString();
}