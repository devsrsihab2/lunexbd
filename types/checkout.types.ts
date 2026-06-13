export type Address = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postcode?: string;
  country: string;
};

export type PaymentMethod = {
  id: string;
  title: string;
  description?: string;
  enabled: boolean;
};

export type ShippingMethod = {
  id: string;
  title: string;
  cost: string;
  zoneName?: string;
  locations?: string[];
};

export type CheckoutOptions = {
  guestCheckoutEnabled: boolean;
  paymentMethods: PaymentMethod[];
  shippingMethods: ShippingMethod[];
  couponsEnabled?: boolean;
  currency?: string;
  countries?: { code: string; name: string }[];
};

export type CheckoutLineItem = {
  productId: number;
  variationId?: number;
  name: string;
  quantity: number;
  price: string;
  image?: string;
};
