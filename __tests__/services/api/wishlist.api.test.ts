import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "@/services/api/wishlist.api";
import { storefrontProxy } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  storefrontProxy: jest.fn(),
}));

describe("wishlist.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get wishlist items with pagination", async () => {
    await getWishlist(2, 20);
    expect(storefrontProxy).toHaveBeenCalledWith("/wishlist?page=2&limit=20", {
      cache: "no-store",
      auth: true,
    });
  });

  it("should add item to wishlist", async () => {
    await addWishlistItem(55);
    expect(storefrontProxy).toHaveBeenCalledWith("/wishlist", {
      method: "POST",
      body: { productId: 55 },
      auth: true,
    });
  });

  it("should remove item from wishlist", async () => {
    await removeWishlistItem(55);
    expect(storefrontProxy).toHaveBeenCalledWith("/wishlist/55", {
      method: "DELETE",
      auth: true,
    });
  });
});
