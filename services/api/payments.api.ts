import { storefrontProxy } from "./http";
import type { PaymentMethod } from "@/types/checkout.types";

export function getPaymentMethods() {
  return storefrontProxy<PaymentMethod[]>("/checkout/payment-methods", { cache: "no-store" });
}
