import { lunexEndpoints } from "@/services/wordpress/endpoints";

describe("lunexEndpoints", () => {
  it("should contain the correct list of endpoint mappings", () => {
    expect(Array.isArray(lunexEndpoints)).toBe(true);
    expect(lunexEndpoints.length).toBeGreaterThan(0);
    expect(lunexEndpoints).toContain("GET /wp-json/lunex/v1/home");
    expect(lunexEndpoints).toContain("POST /wp-json/lunex/v1/auth/login");
  });
});
