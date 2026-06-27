import {
  getHome,
  getSettings,
  getMenus,
  getCmsPage,
  getCmsPageWithFallbacks,
  getBlogPosts,
  getBlogPost,
  submitContact,
  submitSubscription,
} from "@/services/api/content.api";
import { storefrontProxy } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  storefrontProxy: jest.fn(),
}));

describe("content.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch home", async () => {
    await getHome();
    expect(storefrontProxy).toHaveBeenCalledWith("/home", {
      next: { revalidate: 300, tags: ["home"] },
    });
  });

  it("should fetch settings", async () => {
    await getSettings();
    expect(storefrontProxy).toHaveBeenCalledWith("/settings", {
      next: { revalidate: 600, tags: ["settings"] },
    });
  });

  it("should fetch menus", async () => {
    await getMenus();
    expect(storefrontProxy).toHaveBeenCalledWith("/menus", {
      next: { revalidate: 600, tags: ["menus"] },
    });
  });

  it("should fetch CMS page", async () => {
    await getCmsPage("about-us");
    expect(storefrontProxy).toHaveBeenCalledWith("/pages/about-us", {
      next: { revalidate: 600, tags: ["cms-pages", "cms-page-about-us"] },
    });
  });

  it("should fetch CMS page with fallbacks", async () => {
    (storefrontProxy as jest.Mock)
      .mockResolvedValueOnce({ success: false })
      .mockResolvedValueOnce({ success: true, data: { title: "Found" } });

    const response = await getCmsPageWithFallbacks(["nonexistent", "fallback-slug"]);
    expect(response.success).toBe(true);
    expect(storefrontProxy).toHaveBeenCalledTimes(2);
  });

  it("should fetch blog posts", async () => {
    await getBlogPosts({ page: 2 });
    expect(storefrontProxy).toHaveBeenCalledWith("/posts", {
      query: { page: 2 },
      next: { revalidate: 300, tags: ["blog-posts"] },
    });
  });

  it("should fetch blog post detail", async () => {
    await getBlogPost("hello-world");
    expect(storefrontProxy).toHaveBeenCalledWith("/posts/hello-world", {
      next: { revalidate: 300, tags: ["blog-posts", "blog-post-hello-world"] },
    });
  });

  it("should submit contact info", async () => {
    const payload = { name: "John" };
    await submitContact(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/contact", {
      method: "POST",
      body: payload,
    });
  });

  it("should submit subscription info", async () => {
    const payload = { email: "a@b.com" };
    await submitSubscription(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/subscribe", {
      method: "POST",
      body: payload,
    });
  });
});
