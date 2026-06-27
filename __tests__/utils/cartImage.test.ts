import { normalizeCartItemImage, getCartItemImage } from "@/utils/cartImage";
import type { CartItem } from "@/types/cart.types";

describe("cartImage utility", () => {
  describe("normalizeCartItemImage", () => {
    it("should return undefined if no image is passed", () => {
      expect(normalizeCartItemImage(undefined)).toBeUndefined();
    });

    it("should handle string image inputs", () => {
      const result = normalizeCartItemImage("https://example.com/img.jpg", "Fallback Alt");
      expect(result).toEqual({
        src: "https://example.com/img.jpg",
        alt: "Fallback Alt",
      });
    });

    it("should return undefined for empty string inputs", () => {
      expect(normalizeCartItemImage("   ")).toBeUndefined();
    });

    it("should handle object image inputs with src/url/source_url", () => {
      // test with src
      expect(normalizeCartItemImage({ id: 1, src: "https://example.com/1.jpg" })).toEqual({
        id: 1,
        src: "https://example.com/1.jpg",
        alt: undefined,
      });

      // test with url
      // @ts-ignore
      expect(normalizeCartItemImage({ id: 2, url: "https://example.com/2.jpg", alt: "Alt text" })).toEqual({
        id: 2,
        src: "https://example.com/2.jpg",
        alt: "Alt text",
      });

      // test with source_url and alt_text
      // @ts-ignore
      expect(normalizeCartItemImage({ id: 3, source_url: "https://example.com/3.jpg", alt_text: "Alt text 2" })).toEqual({
        id: 3,
        src: "https://example.com/3.jpg",
        alt: "Alt text 2",
      });
    });
  });

  describe("getCartItemImage", () => {
    it("should retrieve image from a cart item", () => {
      const mockItem = {
        name: "Test Product",
        image: "https://example.com/prod.jpg",
      } as unknown as CartItem;

      const result = getCartItemImage(mockItem);
      expect(result).toEqual({
        src: "https://example.com/prod.jpg",
        alt: "Test Product",
      });
    });
  });
});
