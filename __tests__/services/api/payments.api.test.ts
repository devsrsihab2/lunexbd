import { getPaymentMethods } from "@/services/api/payments.api";
import { storefrontProxy } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  storefrontProxy: jest.fn(),
}));

describe("payments.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch payment methods", async () => {
    await getPaymentMethods();
    expect(storefrontProxy).toHaveBeenCalledWith("/checkout/payment-methods", {
      cache: "no-store",
    });
  });
});
