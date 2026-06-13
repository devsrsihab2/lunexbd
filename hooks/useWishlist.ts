"use client";

import { useSyncExternalStore } from "react";
import { wishlistStore } from "@/store/wishlist.store";

export function useWishlist() {
  return useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot, wishlistStore.getSnapshot);
}
