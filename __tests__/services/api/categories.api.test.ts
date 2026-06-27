import {
  getCategories,
  getCategoryBySlug,
  getCategoryProducts,
} from "@/services/api/categories.api";
import { apiFetch } from "@/services/api/http";
import { getPublicWooProducts } from "@/services/api/products.api";

jest.mock("@/services/api/http", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@/services/api/products.api", () => ({
  getPublicWooProducts: jest.fn(),
}));

describe("categories.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockWooCategories = [
    {
      id: 1,
      slug: "electronics",
      name: "Electronics",
      description: "Electronic devices",
      count: 10,
      image: { src: "https://example.com/elec.jpg", alt: "Elec Alt" },
    },
  ];

  it("should fetch and merge categories", async () => {
    (apiFetch as jest.Mock)
      .mockResolvedValueOnce({ success: true, data: mockWooCategories }) // storeCategories
      .mockResolvedValueOnce({ success: true, data: [] }); // featuredCategories

    const response = await getCategories();
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].slug).toBe("electronics");
    expect(response.data[0].image).toEqual({
      src: "https://example.com/elec.jpg",
      alt: "Elec Alt",
    });
  });

  it("should find category by slug", async () => {
    (apiFetch as jest.Mock)
      .mockResolvedValueOnce({ success: true, data: mockWooCategories })
      .mockResolvedValueOnce({ success: true, data: [] });

    const response = await getCategoryBySlug("electronics");
    expect(response.success).toBe(true);
    expect(response.data.id).toBe(1);
  });

  it("should get category products", async () => {
    (getPublicWooProducts as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
    await getCategoryProducts("electronics", { page: 1 });
    expect(getPublicWooProducts).toHaveBeenCalledWith({
      page: 1,
      category: "electronics",
    });
  });
});
