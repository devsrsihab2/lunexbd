import type { Product } from "./product.types";

export type WishlistSettings = {
  guestWishlistEnabled: boolean;
};

export type Wishlist = {
  items: Product[];
  settings: WishlistSettings;
};
