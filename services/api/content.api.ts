import { storefrontProxy } from "./http";
import type { BlogPost, BlogPostsQuery, CmsPage, HomeContent, MenuItem, SiteSettings } from "@/types/content.types";

export function getHome() {
  return storefrontProxy<HomeContent>("/home", {
    next: { revalidate: 300, tags: ["home"] },
  });
}

export function getSettings() {
  return storefrontProxy<SiteSettings>("/settings", {
    next: { revalidate: 600, tags: ["settings"] },
  });
}

export function getMenus() {
  return storefrontProxy<{ top?: MenuItem[]; header: MenuItem[]; mega?: MenuItem[]; footer: MenuItem[] }>("/menus", {
    next: { revalidate: 600, tags: ["menus"] },
  });
}

export function getCmsPage(slug: string) {
  return storefrontProxy<CmsPage>(`/pages/${slug}`, {
    next: { revalidate: 600, tags: ["cms-pages", `cms-page-${slug}`] },
  });
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
  return storefrontProxy<BlogPost[]>("/posts", {
    query,
    next: { revalidate: 300, tags: ["blog-posts"] },
  });
}

export function getBlogPost(slug: string) {
  return storefrontProxy<BlogPost>(`/posts/${slug}`, {
    next: { revalidate: 300, tags: ["blog-posts", `blog-post-${slug}`] },
  });
}

export function submitContact(payload: unknown) {
  return storefrontProxy<{ received: boolean; id?: number }>("/contact", { method: "POST", body: payload });
}

export function submitSubscription(payload: unknown) {
  return storefrontProxy<{ subscribed: boolean; id?: number }>("/subscribe", { method: "POST", body: payload });
}
