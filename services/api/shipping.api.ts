import { storefrontProxy } from "./http";
import type { ShippingMethod } from "@/types/checkout.types";

export function getShippingMethods() {
  return storefrontProxy<ShippingMethod[]>("/checkout/shipping-methods", { cache: "no-store" });
}
