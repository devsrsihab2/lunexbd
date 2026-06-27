import { applyCoupon, removeCoupon } from "@/services/api/coupons.api";
import { storefrontProxy } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  storefrontProxy: jest.fn(),
}));

describe("coupons.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should apply coupon", async () => {
    await applyCoupon("50OFF");
    expect(storefrontProxy).toHaveBeenCalledWith("/coupon", {
      method: "POST",
      body: JSON.stringify({ code: "50OFF" }),
    });
  });

  it("should remove coupon", async () => {
    await removeCoupon("50OFF");
    expect(storefrontProxy).toHaveBeenCalledWith("/coupon/50OFF", {
      method: "DELETE",
    });
  });
});
