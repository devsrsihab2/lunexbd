import { createStore } from "./createStore";
import type { Wishlist } from "@/types/wishlist.types";

export const wishlistStore = createStore<{ wishlist: Wishlist | null; syncing: boolean }>({
  wishlist: null,
  syncing: false,
});
