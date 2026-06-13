import { storefrontProxy } from "./http";
import type { Cart } from "@/types/cart.types";

export function applyCoupon(code: string) {
  return storefrontProxy<Cart>("/coupon", { method: "POST", body: JSON.stringify({ code }) });
}

export function removeCoupon(code: string) {
  return storefrontProxy<Cart>(`/coupon/${encodeURIComponent(code)}`, { method: "DELETE" });
}
