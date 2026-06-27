import { formatPrice } from "@/utils/formatPrice";

describe("formatPrice", () => {
  it("should format default currency (BDT) with Taka symbol", () => {
    expect(formatPrice(100)).toContain("৳");
    expect(formatPrice(100)).toContain("100");
  });

  it("should format string numbers correctly", () => {
    expect(formatPrice("250.50")).toContain("251"); // maximumFractionDigits: 0, so 250.50 rounds to 251 or 250 depending on standard locales
  });

  it("should handle undefined and non-numeric inputs gracefully", () => {
    expect(formatPrice(undefined)).toContain("0");
    // @ts-ignore
    expect(formatPrice("invalid")).toContain("0");
  });

  it("should format non-BDT currencies using native currency styling", () => {
    const formattedUsd = formatPrice(100, "USD");
    expect(formattedUsd).toContain("$");
    expect(formattedUsd).toContain("100");
  });
});
