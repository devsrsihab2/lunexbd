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

export type OrderShippingInfo = {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
};

export type OrderBillingInfo = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type Order = {
  id: number;
  number: string;
  status: OrderStatus;
  statusLabel?: string;
  dateCreated: string;
  dateModified?: string;
  datePaid?: string;
  dateCompleted?: string;
  subtotal?: string;
  shippingTotal?: string;
  discountTotal?: string;
  total: string;
  currency?: string;
  paymentMethod?: string;
  paymentMethodTitle?: string;
  customerNote?: string;
  itemsCount?: number;
  billing?: OrderBillingInfo | Address;
  shipping?: OrderShippingInfo | Address;
  items: CartItem[];
};
