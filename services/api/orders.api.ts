import { storefrontProxy } from "./http";
import type { Order } from "@/types/order.types";

export function getOrders(query: { page?: string } = {}) {
  return storefrontProxy<Order[]>("/orders", { query, cache: "no-store", auth: true });
}

export function getOrder(id: string) {
  return storefrontProxy<Order>(`/orders/${id}`, { cache: "no-store", auth: true });
}

export function trackOrder(query: { orderId?: string; email?: string; phone?: string; orderKey?: string; trackingNumber?: string }) {
  return storefrontProxy<Order>("/order-tracking", { query, cache: "no-store" });
}
