import { SITE_NAME } from "./constants";

export function websiteSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lunexbd.com";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://lunexbd.com",
  };
}
