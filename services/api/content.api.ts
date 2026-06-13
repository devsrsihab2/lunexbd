import { storefrontProxy } from "./http";
import type { BlogPost, BlogPostsQuery, CmsPage, HomeContent, MenuItem, SiteSettings } from "@/types/content.types";

export function getHome() {
  return storefrontProxy<HomeContent>("/home", { cache: "no-store" });
}

export function getSettings() {
  return storefrontProxy<SiteSettings>("/settings", { cache: "no-store" });
}

export function getMenus() {
  return storefrontProxy<{ top?: MenuItem[]; header: MenuItem[]; mega?: MenuItem[]; footer: MenuItem[] }>("/menus", { cache: "no-store" });
}

export function getCmsPage(slug: string) {
  return storefrontProxy<CmsPage>(`/pages/${slug}`);
}

export async function getCmsPageWithFallbacks(slugs: string[]) {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  let lastResponse: Awaited<ReturnType<typeof getCmsPage>> | null = null;

  for (const slug of uniqueSlugs) {
    const response = await getCmsPage(slug);
    if (response.success) return response;
    lastResponse = response;
  }

  return lastResponse || getCmsPage(uniqueSlugs[0] || "");
}

export function getBlogPosts(query: BlogPostsQuery = {}) {
  return storefrontProxy<BlogPost[]>("/posts", { query });
}

export function getBlogPost(slug: string) {
  return storefrontProxy<BlogPost>(`/posts/${slug}`);
}

export function submitContact(payload: unknown) {
  return storefrontProxy<{ received: boolean; id?: number }>("/contact", { method: "POST", body: payload });
}
