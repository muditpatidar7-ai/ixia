import type { Metadata } from "next";
import type { ReactNode } from "react";
import { organizationSchema, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "iXIA Local Influencer Marketing Platform", template: "%s | iXIA" },
  description: "iXIA connects local creators and influencers with relevant brand collaboration opportunities and paid marketing campaigns.",
  openGraph: { siteName: "iXIA", type: "website", url: siteUrl },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        {children}
      </body>
    </html>
  );
}
