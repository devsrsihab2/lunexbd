describe("http service - apiFetch & storefrontProxy", () => {
  const originalEnv = process.env;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_WP_API_URL: "https://wp.example.com",
    };

    fetchMock = jest.fn();
    global.fetch = fetchMock;

    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should throw error if NEXT_PUBLIC_WP_API_URL is missing and running on server", async () => {
    delete process.env.NEXT_PUBLIC_WP_API_URL;
    
    // Simulate server environment
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    try {
      const { apiFetch } = require("@/services/api/http");
      const response = await apiFetch("/test");
      expect(response.success).toBe(false);
      expect(response.message).toContain("NEXT_PUBLIC_WP_API_URL");
    } finally {
      global.window = originalWindow;
    }
  });

  it("should execute request successfully on a valid endpoint", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true, data: { val: 42 } }),
      status: 200,
    });

    const { apiFetch } = require("@/services/api/http");
    const response = await apiFetch("/test-ok");
    expect(response.success).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ val: 42 });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://wp.example.com/test-ok"),
      expect.any(Object)
    );
  });

  it("should handle non-JSON responses gracefully", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "text/html" }),
      status: 200,
    });

    const { apiFetch } = require("@/services/api/http");
    const response = await apiFetch("/test-text");
    expect(response.success).toBe(true);
    expect(response.data).toBeNull();
  });

  it("should handle error responses correctly", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Invalid endpoint key" }),
      status: 400,
    });

    const { apiFetch } = require("@/services/api/http");
    const response = await apiFetch("/bad-request");
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBe("Invalid endpoint key");
  });

  it("should handle network/fetch exceptions gracefully", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network Failure"));

    const { apiFetch } = require("@/services/api/http");
    const response = await apiFetch("/network-error");
    expect(response.success).toBe(false);
    expect(response.message).toBe("Network Failure");
  });

  it("should map to the storefront proxy route", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true, data: "ok" }),
      status: 200,
    });

    const { storefrontProxy } = require("@/services/api/http");
    const response = await storefrontProxy("/home");
    expect(response.success).toBe(true);
    // Since window is defined (jsdom), storefrontProxy uses client-side relative path:
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/lunex/home",
      expect.any(Object)
    );
  });
});
