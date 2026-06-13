import type { CartItem, CartItemImage } from "@/types/cart.types";
import type { ProductImage } from "@/types/product.types";

export function normalizeCartItemImage(image: CartItemImage | undefined, fallbackAlt?: string): ProductImage | undefined {
  if (!image) return undefined;

  if (typeof image === "string") {
    const src = image.trim();
    return src ? { src, alt: fallbackAlt } : undefined;
  }

  const src = image.src || ("url" in image ? image.url : undefined) || ("source_url" in image ? image.source_url : undefined);
  if (!src) return undefined;

  return {
    id: image.id,
    src,
    alt: image.alt || ("alt_text" in image ? image.alt_text : undefined) || fallbackAlt,
  };
}

export function getCartItemImage(item: CartItem) {
  return normalizeCartItemImage(item.image, item.name);
}
