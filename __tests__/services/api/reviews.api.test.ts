/**
 * reviews.api.test.ts
 *
 * The reviews.api module reads WP_BASE_URL, WC_CONSUMER_KEY and WC_CONSUMER_SECRET
 * at the top-level (module scope). Jest caches modules by default, so we must call
 * jest.resetModules() and use require() *inside* each test after setting process.env
 * so that the fresh module picks up the new values.
 */
describe("reviews.api service", () => {
  const originalEnv = process.env;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    // Set env vars BEFORE the module is loaded via require()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_WP_API_URL: "https://wp.example.com",
      WP_BASE_URL: "https://wp.example.com",
      WC_CONSUMER_KEY: "ck_test",
      WC_CONSUMER_SECRET: "cs_test",
    };

    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should get product reviews via WC REST API fallback", async () => {
    const mockWooReview = {
      id: 1,
      product_id: 101,
      reviewer: "John Doe",
      reviewer_email: "john@example.com",
      review: "Nice product",
      rating: 5,
      verified: true,
      date_created: "2026-06-27T00:00:00",
    };

    // First fetch (custom /lunex/v1 endpoint) fails → falls through to wc/v3
    fetchMock
      .mockRejectedValueOnce(new Error("Custom endpoint unavailable"))
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => [mockWooReview],
      });

    const { getProductReviews } = require("@/services/api/reviews.api");
    const response = await getProductReviews(101);

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].reviewer).toBe("John Doe");
    expect(response.data[0].rating).toBe(5);
  });

  it("should create a product review via WC REST API", async () => {
    const mockCreatedReview = {
      id: 2,
      product_id: 101,
      reviewer: "Alice",
      review: "Excellent!",
      rating: 4,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockCreatedReview,
    });

    const { createProductReview } = require("@/services/api/reviews.api");
    const response = await createProductReview({
      productId: 101,
      reviewer: "Alice",
      review: "Excellent!",
      rating: 4,
      // no authToken → uses WC REST API directly
    });

    expect(response.success).toBe(true);
    expect(response.data.id).toBe(2);
    expect(response.data.reviewer).toBe("Alice");
  });

  it("should get user reviews history", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => [],
    });

    const { getUserReviews } = require("@/services/api/reviews.api");
    const response = await getUserReviews("test_auth_token");

    expect(response.success).toBe(true);
    expect(response.data).toEqual([]);
  });

  it("should return empty array when getProductReviews completely fails", async () => {
    // Both fetch calls fail
    fetchMock
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"));

    const { getProductReviews } = require("@/services/api/reviews.api");
    const response = await getProductReviews(999);

    expect(response.success).toBe(false);
    expect(response.data).toEqual([]);
  });
});
