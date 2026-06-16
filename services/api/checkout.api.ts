import { storefrontProxy } from "./http";
import type {
  CheckoutCouponPayload,
  CheckoutCouponResult,
  CheckoutOptions,
  CheckoutOrderPayload,
} from "@/types/checkout.types";
import type { Order } from "@/types/order.types";

export function getCheckoutOptions() {
  return storefrontProxy<CheckoutOptions>("/checkout/options", {
    cache: "no-store",
  });
}

export function applyCheckoutCoupon(payload: CheckoutCouponPayload) {
  return storefrontProxy<CheckoutCouponResult>("/checkout/coupon", {
    method: "POST",
    body: payload,
  });
}

export function placeOrder(payload: CheckoutOrderPayload) {
  return storefrontProxy<{
    order: Order;
    orderKey?: string;
    redirectUrl?: string;
  }>("/checkout", {
    method: "POST",
    body: payload,
    auth: true,
  });
}
