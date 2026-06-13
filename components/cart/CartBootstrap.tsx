"use client";

import { useEffect } from "react";
import { getCart } from "@/services/api/cart.api";
import { cartStore } from "@/store/cart.store";

export function CartBootstrap() {
  useEffect(() => {
    let active = true;
    cartStore.setState({ ...cartStore.getSnapshot(), loading: true });
    getCart().then((response) => {
      if (!active) return;
      cartStore.setState({
        cart: response.success ? response.data : null,
        loading: false,
        error: response.success ? undefined : response.message,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return null;
}
