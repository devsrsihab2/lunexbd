import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  rememberCartProductImage,
} from "@/services/api/cart.api";
import { apiFetch } from "@/services/api/http";
import { getProductById } from "@/services/api/products.api";

jest.mock("@/services/api/http", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@/services/api/products.api", () => ({
  getProductById: jest.fn().mockResolvedValue({ success: false, data: null }),
}));

describe("cart.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProductById as jest.Mock).mockResolvedValue({ success: false, data: null });
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  const mockWooCart = {
    items: [
      {
        key: "item_key_1",
        id: 123,
        quantity: 2,
        name: "Mock Product",
        prices: {
          price: "1000", // 10.00
          currency_minor_unit: 2,
        },
        totals: {
          line_subtotal: "2000",
          line_total: "2000",
          currency_minor_unit: 2,
        },
      },
    ],
    totals: {
      total_items: "2000",
      total_discount: "200",
      total_price: "1800",
      currency_minor_unit: 2,
    },
  };

  it("should fetch and normalize cart data", async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockWooCart,
    });

    const response = await getCart();
    expect(response.success).toBe(true);
    expect(response.data.items[0].name).toBe("Mock Product");
    expect(response.data.items[0].price).toBe("10"); // 1000 / 100
    expect(response.data.totals.total).toBe("18"); // 1800 / 100
    expect(apiFetch).toHaveBeenCalledWith("/wc/store/v1/cart", {
      cache: "no-store",
    });
  });

  it("should add cart item", async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockWooCart,
    });

    const response = await addCartItem({ productId: 123, quantity: 2 });
    expect(response.success).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith("/wc/store/v1/cart/add-item", {
      method: "POST",
      body: { id: 123, quantity: 2 },
    });
  });

  it("should update cart item", async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockWooCart,
    });

    const response = await updateCartItem("item_key_1", 3);
    expect(response.success).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith("/wc/store/v1/cart/update-item", {
      method: "POST",
      body: { key: "item_key_1", quantity: 3 },
    });
  });

  it("should remove cart item", async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockWooCart,
    });

    const response = await removeCartItem("item_key_1");
    expect(response.success).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith("/wc/store/v1/cart/remove-item", {
      method: "POST",
      body: { key: "item_key_1" },
    });
  });
});
