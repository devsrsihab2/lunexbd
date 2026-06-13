import { createStore } from "./createStore";

export const uiStore = createStore<{ cartDrawerOpen: boolean; mobileMenuOpen: boolean }>({
  cartDrawerOpen: false,
  mobileMenuOpen: false,
});
