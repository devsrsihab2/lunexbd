import type { Product, ProductQuery } from "@/types/product.types";
import type { ApiResponse } from "@/types/api.types";

const wpApiUrl = process.env.NEXT_PUBLIC_WP_API_URL;

type QueryValue = string | number | boolean | null | undefined;

type WooStoreImage = {
  id?: number;
  src?: string;
  thumbnail?: string;
  alt?: string;
};

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  type: string;
  sku?: string;
  short_description?: string;
  description?: string;
  average_rating?: string;
  review_count?: number;
  images?: WooStoreImage[];
  categories?: { id: number; name: string; slug: string }[];
  attributes?: {
    name: string;
    terms?: string[];
    options?: string[];
    variation?: boolean;
  }[];
  variations?: Product["variations"];
  prices?: {
    price?: string;
    regular_price?: string;
    sale_price?: string;
    currency_minor_unit?: number;
  };
  is_in_stock?: boolean;
  stock_availability?: { text?: string };
};

type WooStoreCategory = {
  id: number;
  slug: string;
};

let categoryIdBySlugCache: Record<string, string> | null = null;

function decodeHtml(value?: string) {
  if (!value) return "";

  return value
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function appendQuery(url: string, query?: Record<string, QueryValue>) {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  if (!queryString) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  if (typeof window !== "undefined" && path.startsWith("/wc/store/v1/")) {
    return appendQuery(
      `/api/store/${path.replace(/^\/wc\/store\/v1\//, "")}`,
      query,
    );
  }

  if (!wpApiUrl) {
    throw new Error("NEXT_PUBLIC_WP_API_URL is not defined.");
  }

  const baseUrl = wpApiUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function fetchWooStore<T>(
  path: string,
  query?: Record<string, QueryValue>,
  options?: RequestInit & { noStore?: boolean },
): Promise<ApiResponse<T>> {
  try {
    const { noStore: _noStore, ...fetchOptions } = options || {};

    const response = await fetch(buildUrl(path, query), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(fetchOptions.headers || {}),
      },
      ...fetchOptions,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const data = isJson ? await response.json() : null;

    const headers = {
      "x-wp-total": response.headers.get("x-wp-total") || "",
      "x-wp-totalpages": response.headers.get("x-wp-totalpages") || "",
      "x-wp-page": String(query?.page || "1"),
    };

    if (!response.ok) {
      return {
        success: false,
        data: null as T,
        message:
          data?.message ||
          data?.error ||
          `Request failed with ${response.status}`,
        headers,
      };
    }

    return {
      success: true,
      data: data as T,
      message: "Success",
      headers,
    };
  } catch (error) {
    return {
      success: false,
      data: null as T,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching product data.",
    };
  }
}

function toMajorUnit(value?: string, minorUnit = 2) {
  if (!value) return "";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return value;

  return String(amount / 10 ** minorUnit);
}

function mapWooProduct(product: WooStoreProduct): Product {
  const minorUnit = product.prices?.currency_minor_unit ?? 2;

  const images = (product.images || []).flatMap((image) => {
    const fullImage = image.src;
    const thumbnail = image.thumbnail || image.src;

    if (!fullImage && !thumbnail) return [];

    return [
      {
        id: image.id,
        src: fullImage || thumbnail || "",
        thumbnail,
        alt: decodeHtml(image.alt || product.name),
      },
    ];
  });

  return {
    id: product.id,
    slug: product.slug,
    name: decodeHtml(product.name),
    type: product.type,
    price: toMajorUnit(product.prices?.price, minorUnit),
    regularPrice: toMajorUnit(product.prices?.regular_price, minorUnit),
    salePrice: toMajorUnit(product.prices?.sale_price, minorUnit),
    shortDescription: decodeHtml(product.short_description),
    description: product.description,
    sku: product.sku,
    stockStatus:
      product.stock_availability?.text ||
      (product.is_in_stock ? "In stock" : "Out of stock"),
    averageRating: product.average_rating,
    reviewCount: product.review_count,
    images,
    categories: product.categories,
    attributes: product.attributes?.map((attribute) => ({
      name: decodeHtml(attribute.name),
      options: attribute.terms || attribute.options || [],
      variation: attribute.variation,
    })),
    variations: product.variations,
  };
}

async function getCategoryIdBySlug(slug: string) {
  const cleanSlug = decodeURIComponent(slug).trim();

  if (!cleanSlug || /^\d+$/.test(cleanSlug)) return cleanSlug;

  if (!categoryIdBySlugCache) {
    const response = await fetchWooStore<WooStoreCategory[]>("/wc/store/v1/products/categories");
    categoryIdBySlugCache = {};

    if (response.success && Array.isArray(response.data)) {
      response.data.forEach((category) => {
        categoryIdBySlugCache![category.slug] = String(category.id);
      });
    }
  }

  return categoryIdBySlugCache[cleanSlug] || cleanSlug;
}

async function mapWooQuery(query: ProductQuery = {}): Promise<ProductQuery> {
  const { sort, page, min_price, max_price, stock_status, ...rest } = query;

  const nextQuery: ProductQuery = {
    ...rest,
    page,
    per_page: query.per_page || "50",
  };

  if (sort === "price_asc") {
    nextQuery.orderby = "price";
    nextQuery.order = "asc";
  } else if (sort === "price_desc") {
    nextQuery.orderby = "price";
    nextQuery.order = "desc";
  } else if (sort === "best_selling") {
    nextQuery.orderby = "popularity";
  } else if (sort === "featured") {
    nextQuery.featured = "true";
  } else {
    nextQuery.orderby = "date";
    nextQuery.order = "desc";
  }

  if (min_price) {
    nextQuery.min_price = String(Math.round(Number(min_price) * 100));
  }

  if (max_price) {
    nextQuery.max_price = String(Math.round(Number(max_price) * 100));
  }

  if (stock_status) {
    nextQuery.stock_status = stock_status;
  }

  if (query.category) {
    nextQuery.category = await getCategoryIdBySlug(query.category);
  }

  return nextQuery;
}

function mapProductResponse(
  response: ApiResponse<WooStoreProduct[]>,
): ApiResponse<Product[]> {
  const total = Number(response.headers?.["x-wp-total"] || 0);
  const totalPages = Number(response.headers?.["x-wp-totalpages"] || 0);

  return {
    ...response,
    data:
      response.success && Array.isArray(response.data)
        ? response.data.map(mapWooProduct)
        : [],
    pagination: totalPages
      ? {
          page: Number(response.headers?.["x-wp-page"] || 1),
          perPage: Array.isArray(response.data) ? response.data.length : 0,
          total,
          totalPages,
        }
      : response.pagination,
  };
}

export async function getProducts(query: ProductQuery = {}) {
  const response = await getPublicWooProducts(query);

  if (query.sort === "featured" && response.success && !response.data.length) {
    return getPublicWooProducts({ ...query, sort: "latest" });
  }

  return response;
}

export async function getProductBySlug(
  slug: string,
): Promise<ApiResponse<Product>> {
  const cleanSlug = decodeURIComponent(slug).trim();

  const bySlugResponse = await getPublicWooProducts(
    {
      slug: cleanSlug,
      per_page: "1",
    },
  );

  if (!bySlugResponse.success) {
    return {
      ...bySlugResponse,
      data: null as unknown as Product,
    };
  }

  const directProduct =
    bySlugResponse.data.find((product) => product.slug === cleanSlug) ||
    bySlugResponse.data[0];

  if (directProduct) {
    return {
      success: true,
      data: directProduct,
      message: "Success",
    };
  }

  const fallbackResponse = await getPublicWooProducts(
    {
      search: cleanSlug.replace(/-/g, " "),
      per_page: "20",
    },
  );

  if (!fallbackResponse.success) {
    return {
      ...fallbackResponse,
      data: null as unknown as Product,
    };
  }

  const fallbackProduct = fallbackResponse.data.find(
    (product) => product.slug === cleanSlug,
  );

  if (!fallbackProduct) {
    return {
      success: false,
      data: null as unknown as Product,
      message: `Product not found for slug: ${cleanSlug}`,
    };
  }

  return {
    success: true,
    data: fallbackProduct,
    message: "Success",
  };
}

export function getRelatedProducts(productId: number) {
  return getPublicWooProducts({
    related: String(productId),
    per_page: "4",
  });
}

export async function getProductById(
  id: string | number,
): Promise<ApiResponse<Product>> {
  const response = await getPublicWooProducts({
    include: String(id),
    per_page: "1",
  });

  if (!response.success) {
    return {
      ...response,
      data: null as unknown as Product,
    };
  }

  const product = response.data[0];

  if (!product) {
    return {
      success: false,
      data: null as unknown as Product,
      message: "Product not found.",
    };
  }

  return {
    success: true,
    data: product,
    message: "Success",
  };
}

export async function getPublicWooProducts(
  query: ProductQuery = {},
  options?: { noStore?: boolean },
): Promise<ApiResponse<Product[]>> {
  const wooQuery = await mapWooQuery(query);
  const response = await fetchWooStore<WooStoreProduct[]>(
    "/wc/store/v1/products",
    wooQuery,
    options,
  );

  return mapProductResponse(response);
}
