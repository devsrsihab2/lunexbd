"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useCart } from "@/hooks/useCart";
import { uiStore } from "@/store/ui.store";
import { CartSidebar } from "./CartSidebar";
import { StickyCartButton } from "./StickyCartButton";

export function CartExperience() {
  const { cart, loading } = useCart();
  const ui = useSyncExternalStore(uiStore.subscribe, uiStore.getSnapshot, uiStore.getSnapshot);
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const openCart = useCallback(() => {
    uiStore.setState({ ...uiStore.getSnapshot(), cartDrawerOpen: true });
  }, []);

  const closeCart = useCallback(() => {
    uiStore.setState({ ...uiStore.getSnapshot(), cartDrawerOpen: false });
  }, []);

  return (
    <>
      <StickyCartButton cart={cart} itemCount={itemCount} loading={loading} onOpen={openCart} />
      <CartSidebar cart={cart} itemCount={itemCount} isOpen={ui.cartDrawerOpen} onClose={closeCart} />
    </>
  );
}
