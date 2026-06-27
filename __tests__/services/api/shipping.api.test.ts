import { getShippingMethods } from "@/services/api/shipping.api";
import { storefrontProxy } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  storefrontProxy: jest.fn(),
}));

describe("shipping.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch shipping methods", async () => {
    await getShippingMethods();
    expect(storefrontProxy).toHaveBeenCalledWith("/checkout/shipping-methods", {
      cache: "no-store",
    });
  });
});
