import { getOrders, getOrder, trackOrder } from "@/services/api/orders.api";
import { storefrontProxy } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  storefrontProxy: jest.fn(),
}));

describe("orders.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get orders list", async () => {
    await getOrders({ page: "2" });
    expect(storefrontProxy).toHaveBeenCalledWith("/orders", {
      query: { page: "2" },
      cache: "no-store",
      auth: true,
    });
  });

  it("should get single order", async () => {
    await getOrder("123");
    expect(storefrontProxy).toHaveBeenCalledWith("/orders/123", {
      cache: "no-store",
      auth: true,
    });
  });

  it("should track order", async () => {
    const query = { orderId: "123", email: "a@b.com" };
    await trackOrder(query);
    expect(storefrontProxy).toHaveBeenCalledWith("/order-tracking", {
      query,
      cache: "no-store",
    });
  });
});
