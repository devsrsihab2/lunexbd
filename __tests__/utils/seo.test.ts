import { createMetadata } from "@/utils/seo";

describe("createMetadata", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return metadata with default values when input is empty", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://lunexbd.test";
    const metadata = createMetadata({});

    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
    expect(metadata.alternates?.canonical).toBe("https://lunexbd.test/");
  });

  it("should prioritize and incorporate input title, path, and description", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://lunexbd.test";
    const metadata = createMetadata({
      title: "My Product",
      description: "My custom description",
      path: "/product/my-product",
    });

    expect(metadata.title).toContain("My Product");
    expect(metadata.description).toBe("My custom description");
    expect(metadata.alternates?.canonical).toBe("https://lunexbd.test/product/my-product");
    expect(metadata.openGraph?.title).toContain("My Product");
    expect(metadata.openGraph?.url).toBe("https://lunexbd.test/product/my-product");
  });

  it("should set twitter and icons correctly", () => {
    const metadata = createMetadata({
      image: "https://lunexbd.test/image.jpg",
      favicon: "/custom-favicon.png",
    });

    expect(metadata.twitter?.images).toEqual(["https://lunexbd.test/image.jpg"]);
    expect(metadata.icons).toEqual({
      icon: [{ url: "/custom-favicon.png" }],
      shortcut: [{ url: "/custom-favicon.png" }],
      apple: [{ url: "/custom-favicon.png" }],
    });
  });
});
