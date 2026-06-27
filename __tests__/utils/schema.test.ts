/**
 * schema.test.ts
 *
 * Tests websiteSchema() and organizationSchema() utility functions.
 * Covers both default fallback URL and env-provided URL.
 */
import { websiteSchema, organizationSchema } from "@/utils/schema";

describe("schema utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("websiteSchema()", () => {
    it("should use default site URL when env var is not set", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      const schema = websiteSchema();
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("WebSite");
      expect(schema.url).toBe("https://lunexbd.com");
      expect(schema.name).toBe("Lunexbd");
    });

    it("should use NEXT_PUBLIC_SITE_URL when set", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://staging.lunexbd.com";
      const schema = websiteSchema();
      expect(schema.url).toBe("https://staging.lunexbd.com");
    });

    it("should include a SearchAction potentialAction with correct target", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://lunexbd.com";
      const schema = websiteSchema();
      expect(schema.potentialAction["@type"]).toBe("SearchAction");
      expect(schema.potentialAction.target).toContain("/search?q=");
      expect(schema.potentialAction["query-input"]).toBe("required name=search_term_string");
    });
  });

  describe("organizationSchema()", () => {
    it("should use default URL when env var is not set", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      const schema = organizationSchema();
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Organization");
      expect(schema.name).toBe("Lunexbd");
      expect(schema.url).toBe("https://lunexbd.com");
    });

    it("should use NEXT_PUBLIC_SITE_URL when set", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://production.lunexbd.com";
      const schema = organizationSchema();
      expect(schema.url).toBe("https://production.lunexbd.com");
    });
  });
});
