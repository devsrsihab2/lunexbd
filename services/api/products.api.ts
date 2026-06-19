import type {
  Product,
  ProductFilterOption,
  ProductQuery,
  ProductSwatchAttribute,
  ProductVariation,
} from "@/types/product.types";
import type { ApiResponse } from "@/types/api.types";

const wpApiUrl = process.env.NEXT_PUBLIC_WP_API_URL;

const BRAND_ATTRIBUTE_TAXONOMY = "pa_brand";

type QueryValue = string | number | boolean | null | undefined;

type WooStoreImage = {
  id?: number;
  src?: string;
  thumbnail?: string;
  alt?: string;
};

type WooStoreAttributeTerm =
  | string
  | {
      id?: number;
      name?: string;
      slug?: string;
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
    terms?: WooStoreAttributeTerm[];
    options?: WooStoreAttributeTerm[];
    variation?: boolean;
    has_variations?: boolean;
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
  name?: string;
  slug: string;
  count?: number;
};

type WooStoreProductAttribute = {
  id: number;
  name?: string;
  slug?: string;
  taxonomy?: string;
};

type WooStoreProductAttributeTerm = {
  id?: number;
  name?: string;
  slug: string;
  count?: number;
};

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

function toSlug(value: string) {
  return decodeHtml(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function addCacheBuster(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_lunex_no_cache=${Date.now()}`;
}

async function fetchWooStore<T>(
  path: string,
  query?: Record<string, QueryValue>,
  options?: RequestInit & {
    noStore?: boolean;
    next?: {
      revalidate?: number | false;
      tags?: string[];
    };
  },
): Promise<ApiResponse<T>> {
  try {
    const { noStore = false, headers, cache, next, ...fetchOptions } = options || {};
    const shouldNoStore = noStore || cache === "no-store";
    const requestUrl = shouldNoStore
      ? addCacheBuster(buildUrl(path, query))
      : buildUrl(path, query);

    const requestHeaders: HeadersInit = {
      Accept: "application/json",
      ...(shouldNoStore
        ? {
            "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          }
        : {}),
      ...(headers || {}),
    };

    const response = await fetch(requestUrl, {
      ...fetchOptions,
      method: "GET",
      cache: shouldNoStore ? "no-store" : cache,
      next: shouldNoStore ? undefined : { revalidate: 60, ...(next || {}) },
      headers: requestHeaders,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const data = isJson ? await response.json() : null;

    const responseHeaders = {
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
        headers: responseHeaders,
      };
    }

    return {
      success: true,
      data: data as T,
      message: "Success",
      headers: responseHeaders,
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

function normalizeAttributeOptions(values?: WooStoreAttributeTerm[]): string[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => {
      if (typeof value === "string") {
        return decodeHtml(value);
      }

      return decodeHtml(value.name || value.slug || "");
    })
    .filter(Boolean);
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
    attributes: product.attributes
      ?.map((attribute) => ({
        name: decodeHtml(attribute.name),
        options: normalizeAttributeOptions(
          attribute.terms || attribute.options || [],
        ),
        variation: Boolean(attribute.variation || attribute.has_variations),
      }))
      .filter((attribute) => attribute.name && attribute.options.length),
    variations: product.variations,
  };
}

async function getProductSwatches(
  productId: number,
): Promise<ProductSwatchAttribute[]> {
  const response = await fetchWooStore<{
    success: boolean;
    data: ProductSwatchAttribute[];
    message?: string;
  }>(`/lunex/v1/products/${productId}/swatches`);

  if (!response.success || !response.data?.success) {
    return [];
  }

  return Array.isArray(response.data.data) ? response.data.data : [];
}

async function getProductVariations(
  productId: number,
): Promise<ProductVariation[]> {
  const response = await fetchWooStore<{
    success: boolean;
    data: ProductVariation[];
    message?: string;
  }>(`/lunex/v1/products/${productId}/variations`);

  if (!response.success || !response.data?.success) {
    return [];
  }

  return Array.isArray(response.data.data) ? response.data.data : [];
}

async function attachVariableProductData(product: Product): Promise<Product> {
  if (product.type !== "variable") {
    return product;
  }

  const [swatches, detailedVariations] = await Promise.all([
    getProductSwatches(product.id),
    getProductVariations(product.id),
  ]);

  return {
    ...product,
    swatches,
    variations: detailedVariations.length
      ? detailedVariations
      : product.variations,
  };
}

async function getCategoryIdBySlug(slug: string) {
  const cleanSlug = decodeURIComponent(slug).trim();

  if (!cleanSlug || /^\d+$/.test(cleanSlug)) return cleanSlug;

  const response = await fetchWooStore<WooStoreCategory[]>(
    "/wc/store/v1/products/categories",
    { per_page: 100 },
  );

  const categoryIdBySlug: Record<string, string> = {};

  if (response.success && Array.isArray(response.data)) {
    response.data.forEach((category) => {
      categoryIdBySlug[category.slug] = String(category.id);
    });
  }

  return categoryIdBySlug[cleanSlug] || cleanSlug;
}

async function mapWooQuery(query: ProductQuery = {}): Promise<ProductQuery> {
  const { sort, page, min_price, max_price, stock_status, brand, ...rest } =
    query;

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

  if (brand) {
    // WooCommerce Brands uses the `product_brand` taxonomy in wp-admin.
    // The Store API accepts the public `brand` query when WooCommerce Brands is enabled.
    // Do not use `pa_brand` here because your brands are not product attributes.
    nextQuery.brand = brand;
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

function mapFilterOptions(
  options?: WooStoreProductAttributeTerm[] | WooStoreCategory[],
): ProductFilterOption[] {
  if (!Array.isArray(options)) return [];

  return options
    .filter((option) => option.slug && option.name)
    .map((option) => ({
      id: option.id,
      name: decodeHtml(option.name),
      slug: option.slug,
      count: option.count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function isBrandAttribute(attribute: WooStoreProductAttribute) {
  const name = decodeHtml(attribute.name).toLowerCase();
  const slug = decodeHtml(attribute.slug).toLowerCase();
  const taxonomy = decodeHtml(attribute.taxonomy).toLowerCase();

  return (
    taxonomy === BRAND_ATTRIBUTE_TAXONOMY ||
    slug === BRAND_ATTRIBUTE_TAXONOMY ||
    slug === "brand" ||
    name === "brand" ||
    name.includes("brand")
  );
}

async function getProductBrandsFromAttributes(): Promise<
  ApiResponse<ProductFilterOption[]>
> {
  const attributesResponse = await fetchWooStore<WooStoreProductAttribute[]>(
    "/wc/store/v1/products/attributes",
    { per_page: 100 },
  );

  if (!attributesResponse.success || !Array.isArray(attributesResponse.data)) {
    return {
      success: false,
      data: [],
      message: attributesResponse.message || "Unable to load product attributes.",
    };
  }

  const brandAttribute = attributesResponse.data.find(isBrandAttribute);

  if (!brandAttribute?.id) {
    return {
      success: false,
      data: [],
      message: "Brand attribute was not found.",
    };
  }

  const termsResponse = await fetchWooStore<WooStoreProductAttributeTerm[]>(
    `/wc/store/v1/products/attributes/${brandAttribute.id}/terms`,
    { per_page: 100 },
  );

  if (!termsResponse.success) {
    return {
      success: false,
      data: [],
      message: termsResponse.message || "Unable to load product brands.",
    };
  }

  return {
    success: true,
    data: mapFilterOptions(termsResponse.data),
    message: "Success",
  };
}

async function getProductBrandsFromProducts(): Promise<
  ApiResponse<ProductFilterOption[]>
> {
  const response = await getPublicWooProducts({
    per_page: "100",
    sort: "latest",
  });

  if (!response.success) {
    return {
      success: false,
      data: [],
      message: response.message || "Unable to load product brands.",
    };
  }

  const brandMap = new Map<string, ProductFilterOption>();

  response.data.forEach((product) => {
    product.attributes?.forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();

      if (!attributeName.includes("brand")) return;

      attribute.options.forEach((option) => {
        const name = decodeHtml(option);
        const slug = toSlug(name);

        if (!name || !slug) return;

        const current = brandMap.get(slug);

        brandMap.set(slug, {
          name,
          slug,
          count: (current?.count || 0) + 1,
        });
      });
    });
  });

  return {
    success: true,
    data: Array.from(brandMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    message: "Success",
  };
}

export async function getProducts(query: ProductQuery = {}) {
  const response = await getPublicWooProducts(query);

  if (query.sort === "featured" && response.success && !response.data.length) {
    return getPublicWooProducts({ ...query, sort: "latest" });
  }

  return response;
}

export async function getProductCategories(): Promise<
  ApiResponse<ProductFilterOption[]>
> {
  const response = await fetchWooStore<WooStoreCategory[]>(
    "/wc/store/v1/products/categories",
    {
      per_page: 100,
    },
  );

  if (!response.success) {
    return {
      ...response,
      data: [],
    };
  }

  return {
    success: true,
    data: mapFilterOptions(response.data),
    message: "Success",
  };
}

async function getProductBrandsFromProductBrandTaxonomy(): Promise<
  ApiResponse<ProductFilterOption[]>
> {
  const response = await fetchWooStore<{
    success: boolean;
    data: ProductFilterOption[];
    message?: string;
  }>("/lunex/v1/products/brands");

  if (response.success && response.data?.success) {
    return {
      success: true,
      data: Array.isArray(response.data.data) ? response.data.data : [],
      message: response.data.message || "Success",
    };
  }

  return {
    success: false,
    data: [],
    message:
      response.data?.message ||
      response.message ||
      "Unable to load product_brand terms.",
  };
}

export async function getProductBrands(): Promise<
  ApiResponse<ProductFilterOption[]>
> {
  // Your WordPress Brands screen is taxonomy=product_brand, not pa_brand attribute.
  // So the main source must be the custom plugin endpoint below.
  const taxonomyResponse = await getProductBrandsFromProductBrandTaxonomy();

  if (taxonomyResponse.success) {
    return taxonomyResponse;
  }

  // Fallback only: keeps the page safe if the custom plugin endpoint is not updated yet.
  const attributeResponse = await getProductBrandsFromAttributes();

  if (attributeResponse.success && attributeResponse.data.length) {
    return attributeResponse;
  }

  return getProductBrandsFromProducts();
}

export async function getProductBySlug(
  slug: string,
): Promise<ApiResponse<Product>> {
  const cleanSlug = decodeURIComponent(slug).trim();

  const bySlugResponse = await getPublicWooProducts({
    slug: cleanSlug,
    per_page: "1",
  });

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
      data: await attachVariableProductData(directProduct),
      message: "Success",
    };
  }

  const fallbackResponse = await getPublicWooProducts({
    search: cleanSlug.replace(/-/g, " "),
    per_page: "20",
  });

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
    data: await attachVariableProductData(fallbackProduct),
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
    data: await attachVariableProductData(product),
    message: "Success ",
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
