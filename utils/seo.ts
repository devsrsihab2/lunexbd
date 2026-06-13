import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "./constants";

export function createMetadata(input: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  robots?: string;
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lunexbd.com";
  const title = input.title ? `${input.title} | ${SITE_NAME}` : SITE_NAME;
  const description = input.description || DEFAULT_DESCRIPTION;
  const canonical = new URL(input.path || "/", siteUrl).toString();

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
    robots: input.robots,
  };
}
