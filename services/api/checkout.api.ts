import { storefrontProxy } from "./http";
import type { CheckoutOptions } from "@/types/checkout.types";
import type { Order } from "@/types/order.types";

export function getCheckoutOptions() {
  return storefrontProxy<CheckoutOptions>("/checkout/options", { cache: "no-store" });
}

export function placeOrder(payload: unknown) {
  return storefrontProxy<{ order: Order; orderKey?: string; redirectUrl?: string }>("/checkout", {
    method: "POST",
    body: payload,
    auth: true,
  });
}
