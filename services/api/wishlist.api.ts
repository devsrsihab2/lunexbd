import { storefrontProxy } from "./http";
import type { Wishlist } from "@/types/wishlist.types";

export function getWishlist() {
  return storefrontProxy<Wishlist>("/wishlist", { cache: "no-store", auth: true });
}

export function addWishlistItem(productId: number) {
  return storefrontProxy<Wishlist>("/wishlist", { method: "POST", body: { productId }, auth: true });
}

export function removeWishlistItem(productId: number) {
  return storefrontProxy<Wishlist>(`/wishlist/${productId}`, { method: "DELETE", auth: true });
}
