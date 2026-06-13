import type { ProductImage } from "./product.types";

export type CartItemImage =
  | ProductImage
  | string
  | null
  | {
      id?: number;
      src?: string;
      url?: string;
      source_url?: string;
      alt?: string;
      alt_text?: string;
    };

export type CartItem = {
  key: string;
  productId: number;
  variationId?: number;
  name: string;
  quantity: number;
  price: string;
  subtotal: string;
  total: string;
  image?: CartItemImage;
  attributes?: Record<string, string>;
};

export type Cart = {
  items: CartItem[];
  coupons: { code: string; discount: string }[];
  totals: {
    subtotal: string;
    discount?: string;
    shipping?: string;
    tax?: string;
    total: string;
  };
};
