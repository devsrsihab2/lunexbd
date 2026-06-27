import {
  getProducts,
  getProductCategories,
  getProductBrands,
  getProductBySlug,
  getRelatedProducts,
  getProductById,
} from "@/services/api/products.api";

describe("products.api service", () => {
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
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const mockWooProduct = {
    id: 101,
    slug: "cool-shirt",
    name: "Cool Shirt",
    type: "simple",
    prices: {
      price: "1500",
      regular_price: "2000",
      sale_price: "1500",
      currency_minor_unit: 2,
    },
    images: [{ id: 1, src: "https://example.com/shirt.jpg" }],
  };

  it("should fetch products list and map response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        "content-type": "application/json",
        "x-wp-total": "1",
        "x-wp-totalpages": "1",
      }),
      json: async () => [mockWooProduct],
    });

    const response = await getProducts();
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].slug).toBe("cool-shirt");
    expect(response.data[0].price).toBe("15");
  });

  it("should fetch product categories", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => [{ id: 1, name: "Clothes", slug: "clothes", count: 5 }],
    });

    const response = await getProductCategories();
    expect(response.success).toBe(true);
    expect(response.data[0].slug).toBe("clothes");
  });

  it("should get product by id", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => [mockWooProduct],
    });

    const response = await getProductById(101);
    expect(response.success).toBe(true);
    expect(response.data.id).toBe(101);
  });
});
