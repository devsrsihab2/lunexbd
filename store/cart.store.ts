import { createStore } from "./createStore";
import type { Cart } from "@/types/cart.types";

export const cartStore = createStore<{ cart: Cart | null; updatingKey?: string; loading?: boolean; error?: string }>({
  cart: null,
});
