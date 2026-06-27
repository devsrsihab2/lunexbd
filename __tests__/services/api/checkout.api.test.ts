import {
  getCheckoutOptions,
  applyCheckoutCoupon,
  placeOrder,
} from "@/services/api/checkout.api";
import { storefrontProxy } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  storefrontProxy: jest.fn(),
}));

describe("checkout.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get checkout options", async () => {
    await getCheckoutOptions();
    expect(storefrontProxy).toHaveBeenCalledWith("/checkout/options", {
      cache: "no-store",
    });
  });

  it("should apply checkout coupon", async () => {
    const payload = { code: "SAVE50" };
    await applyCheckoutCoupon(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/checkout/coupon", {
      method: "POST",
      body: payload,
    });
  });

  it("should place order", async () => {
    const payload = { billingAddress: {}, paymentMethod: "cod" } as any;
    await placeOrder(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/checkout", {
      method: "POST",
      body: payload,
      auth: true,
    });
  });
});
