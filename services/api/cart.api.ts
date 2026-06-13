import { apiFetch } from "./http";
import { getProductById } from "./products.api";
import type { ApiResponse } from "@/types/api.types";
import type { Cart, CartItem } from "@/types/cart.types";
import type { ProductImage } from "@/types/product.types";
import { normalizeCartItemImage } from "@/utils/cartImage";

const imageCacheKey = "lunex_cart_product_images";
const memoryImages = new Map<string, ProductImage>();

type WooCartImage = {
  id?: number;
  src?: string;
  thumbnail?: string;
  srcset?: string;
  sizes?: string;
  name?: string;
  alt?: string;
};

type WooCartItem = {
  key: string;
  id: number;
  type?: string;
  quantity: number;
  name: string;
  sku?: string;
  permalink?: string;
  images?: WooCartImage[];
  variation?: Array<{ attribute?: string; value?: string }>;
  item_data?: Array<{ name?: string; value?: string }>;
  prices?: {
    price?: string;
    regular_price?: string;
    sale_price?: string;
    currency_minor_unit?: number;
  };
  totals?: {
    line_subtotal?: string;
    line_total?: string;
    line_subtotal_tax?: string;
    line_total_tax?: string;
    currency_minor_unit?: number;
  };
};

type WooCartCoupon = {
  code?: string;
  totals?: {
    total_discount?: string;
  };
};

type WooCart = {
  items?: WooCartItem[];
  coupons?: WooCartCoupon[];
  fees?: unknown[];
  totals?: {
    total_items?: string;
    total_discount?: string;
    total_shipping?: string | null;
    total_tax?: string;
    total_price?: string;
    currency_code?: string;
    currency_symbol?: string;
    currency_minor_unit?: number;
  };
  items_count?: number;
  needs_payment?: boolean;
  needs_shipping?: boolean;
  shipping_rates?: unknown[];
  payment_methods?: unknown[];
  errors?: unknown[];
};

type AddCartItemInput = {
  productId: number;
  quantity?: number;
  variationId?: number;
  variation?: Record<string, string>;
};

function toMajorUnit(value?: string | number | null, minorUnit = 2) {
  if (value === undefined || value === null || value === "") return "0";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "0";

  return String(amount / 10 ** minorUnit);
}

function getWooItemImage(item: WooCartItem): ProductImage | undefined {
  const image = item.images?.[0];

  if (!image?.src && !image?.thumbnail) return undefined;

  return {
    id: image.id,
    src: image.src || image.thumbnail || "",
    alt: image.alt || image.name || item.name,
  };
}

function getWooItemAttributes(item: WooCartItem) {
  const attributes: Record<string, string> = {};

  item.variation?.forEach((variation) => {
    if (variation.attribute && variation.value) {
      attributes[variation.attribute] = variation.value;
    }
  });

  item.item_data?.forEach((data) => {
    if (data.name && data.value) {
      attributes[data.name] = data.value;
    }
  });

  return Object.keys(attributes).length ? attributes : undefined;
}

function normalizeWooCartItem(item: WooCartItem): CartItem {
  const minorUnit =
    item.prices?.currency_minor_unit ?? item.totals?.currency_minor_unit ?? 2;

  const image = getWooItemImage(item);

  return {
    key: item.key,
    productId: item.id,
    variationId: undefined,
    name: item.name,
    quantity: item.quantity,
    price: toMajorUnit(item.prices?.price, minorUnit),
    subtotal: toMajorUnit(item.totals?.line_subtotal, minorUnit),
    total: toMajorUnit(item.totals?.line_total, minorUnit),
    image,
    attributes: getWooItemAttributes(item),
  };
}

function normalizeWooCart(cart: WooCart): Cart {
  const items = cart.items || [];
  const minorUnit = cart.totals?.currency_minor_unit ?? 2;

  return {
    items: items.map(normalizeWooCartItem),
    coupons: (cart.coupons || []).map((coupon) => ({
      code: coupon.code || "",
      discount: toMajorUnit(coupon.totals?.total_discount, minorUnit),
    })),
    totals: {
      subtotal: toMajorUnit(cart.totals?.total_items, minorUnit),
      discount: toMajorUnit(cart.totals?.total_discount, minorUnit),
      shipping: toMajorUnit(cart.totals?.total_shipping, minorUnit),
      tax: toMajorUnit(cart.totals?.total_tax, minorUnit),
      total: toMajorUnit(cart.totals?.total_price, minorUnit),
    },
  };
}

async function normalizeCartResponse(
  response: ApiResponse<WooCart>,
): Promise<ApiResponse<Cart>> {
  if (!response.success || !response.data) {
    return {
      ...response,
      data: null as unknown as Cart,
    };
  }

  return enrichCartImages({
    ...response,
    data: normalizeWooCart(response.data),
  });
}

export async function getCart() {
  return normalizeCartResponse(
    await apiFetch<WooCart>("/wc/store/v1/cart", {
      cache: "no-store",
    }),
  );
}

export async function addCartItem({
  productId,
  quantity = 1,
  variationId,
  variation,
}: AddCartItemInput): Promise<ApiResponse<Cart>> {
  return normalizeCartResponse(
    await apiFetch<WooCart>("/wc/store/v1/cart/add-item", {
      method: "POST",
      body: {
        id: variationId || productId,
        quantity,
        ...(variation ? { variation } : {}),
      },
    }),
  );
}

export async function updateCartItem(key: string, quantity: number) {
  return normalizeCartResponse(
    await apiFetch<WooCart>("/wc/store/v1/cart/update-item", {
      method: "POST",
      body: {
        key,
        quantity,
      },
    }),
  );
}

export async function removeCartItem(key: string) {
  return normalizeCartResponse(
    await apiFetch<WooCart>("/wc/store/v1/cart/remove-item", {
      method: "POST",
      body: {
        key,
      },
    }),
  );
}

export function rememberCartProductImage(
  productId: number,
  image?: ProductImage | null,
  variationId?: number | null,
) {
  const normalized = normalizeCartItemImage(image, "");

  if (!normalized) return;

  setCachedImage(String(productId), normalized);

  if (variationId) {
    setCachedImage(`${productId}:${variationId}`, normalized);
  }
}

async function enrichCartImages(
  response: ApiResponse<Cart>,
): Promise<ApiResponse<Cart>> {
  if (!response.success || !response.data?.items?.length) {
    return response;
  }

  const items = response.data.items;
  const fetchedImages = await fetchMissingProductImages(items);

  return {
    ...response,
    data: {
      ...response.data,
      items: items.map((item) => {
        const image =
          normalizeCartItemImage(item.image, item.name) ||
          getCachedImage(item.productId, item.variationId) ||
          fetchedImages.get(String(item.productId));

        if (!image) return item;

        rememberCartProductImage(item.productId, image, item.variationId);

        return {
          ...item,
          image,
        };
      }),
    },
  };
}

async function fetchMissingProductImages(items: CartItem[]) {
  const productIds = Array.from(
    new Set(
      items
        .filter(
          (item) =>
            !normalizeCartItemImage(item.image, item.name) &&
            !getCachedImage(item.productId, item.variationId),
        )
        .map((item) => item.productId),
    ),
  );

  const images = new Map<string, ProductImage>();

  await Promise.all(
    productIds.map(async (productId) => {
      const response = await getProductById(productId).catch(() => null);
      const product = response?.success ? response.data : null;
      const image = product?.images?.[0];

      if (image?.src) {
        images.set(String(productId), image);
        rememberCartProductImage(productId, image);
      }
    }),
  );

  return images;
}

function getCachedImage(productId: number, variationId?: number | null) {
  hydrateMemoryImages();

  return (
    (variationId
      ? memoryImages.get(`${productId}:${variationId}`)
      : undefined) || memoryImages.get(String(productId))
  );
}

function setCachedImage(key: string, image: ProductImage) {
  memoryImages.set(key, image);

  if (typeof window === "undefined") return;

  try {
    const stored = readStoredImages();
    stored[key] = image;
    window.localStorage.setItem(imageCacheKey, JSON.stringify(stored));
  } catch {
    // Local storage can be unavailable in private browsing or blocked contexts.
  }
}

function hydrateMemoryImages() {
  if (typeof window === "undefined" || memoryImages.size) return;

  Object.entries(readStoredImages()).forEach(([key, image]) => {
    const normalized = normalizeCartItemImage(image, "");

    if (normalized) {
      memoryImages.set(key, normalized);
    }
  });
}

function readStoredImages() {
  if (typeof window === "undefined") {
    return {} as Record<string, ProductImage>;
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(imageCacheKey) || "{}",
    ) as Record<string, ProductImage>;
  } catch {
    return {};
  }
}
