"use client";

import { useSyncExternalStore } from "react";
import { cartStore } from "@/store/cart.store";

export function useCart() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getSnapshot);
}
