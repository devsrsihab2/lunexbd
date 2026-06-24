import type { Product } from "./product.types";

export type WishlistSettings = {
  guestWishlistEnabled: boolean;
};

export type Wishlist = {
  items: Product[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  settings: WishlistSettings;
};
