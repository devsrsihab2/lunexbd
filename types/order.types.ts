import type { Address } from "./checkout.types";
import type { CartItem } from "./cart.types";

export type OrderStatus =
  | "pending"
  | "processing"
  | "on-hold"
  | "completed"
  | "cancelled"
  | "refunded"
  | "failed";

export type Order = {
  id: number;
  number: string;
  status: OrderStatus;
  dateCreated: string;
  total: string;
  paymentMethodTitle?: string;
  billing?: Address;
  shipping?: Address;
  items: CartItem[];
};
