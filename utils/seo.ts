import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "./constants";

export function createMetadata(input: {
  title?: string;
  siteName?: string;
  description?: string;
  path?: string;
  image?: string;
  favicon?: string;
  robots?: string;
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lunexbd.com";
  const siteName = input.siteName || SITE_NAME;
  const title = input.title ? `${input.title} | ${siteName}` : siteName;
  const description = input.description || DEFAULT_DESCRIPTION;
  const canonical = new URL(input.path || "/", siteUrl).toString();
  const favicon = input.favicon || "/favicon.ico";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: input.image ? [input.image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: input.image ? [input.image] : undefined,
    },
    icons: {
      icon: [{ url: favicon }],
      shortcut: [{ url: favicon }],
      apple: [{ url: favicon }],
    },
    robots: input.robots,
  };
}
