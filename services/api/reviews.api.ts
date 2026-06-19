import type { ApiResponse } from "@/types/api.types";
import type { ProductReview } from "@/types/product.types";

const wpBaseUrl = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_API_URL;
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;

type WooProductReview = {
  id: number;
  product_id: number;
  reviewer?: string;
  reviewer_email?: string;
  review?: string;
  rating?: number;
  verified?: boolean;
  date_created?: string;
};

export type CreateProductReviewInput = {
  productId: number;
  reviewer: string;
  reviewerEmail?: string;
  review: string;
  rating: number;
  authToken?: string;
};

function getWooBaseUrl() {
  if (!wpBaseUrl) {
    throw new Error("WP_BASE_URL or NEXT_PUBLIC_WP_API_URL is not configured.");
  }

  return wpBaseUrl.replace(/\/wp-json\/?$/, "").replace(/\/$/, "");
}

function getAuthHeader() {
  if (!consumerKey || !consumerSecret) {
    throw new Error("WooCommerce review API credentials are not configured.");
  }

  return `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`;
}

function decodeHtml(value?: string) {
  if (!value) return "";

  return value
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapReview(review: WooProductReview): ProductReview {
  return {
    id: review.id,
    productId: review.product_id,
    reviewer: decodeHtml(review.reviewer) || "Customer",
    reviewerEmail: review.reviewer_email,
    review: review.review || "",
    rating: Number(review.rating) || 0,
    verified: Boolean(review.verified),
    dateCreated: review.date_created,
  };
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type");
  const body = contentType?.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    return {
      success: false,
      data: null as T,
      message:
        body?.message ||
        body?.error ||
        `WooCommerce review request failed with ${response.status}`,
      status: response.status,
    };
  }

  return {
    success: true,
    data: body as T,
    message: "Success",
    status: response.status,
  };
}

export async function getProductReviews(
  productId: number,
): Promise<ApiResponse<ProductReview[]>> {
  try {
    const url = new URL(
      `/wp-json/lunex/v1/products/${productId}/reviews`,
      `${getWooBaseUrl()}/`,
    );

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300, tags: [`product-reviews-${productId}`] },
    });

    const rawResult = await parseResponse<{ success?: boolean; data?: ProductReview[] } | ProductReview[]>(response);

    if (rawResult.success) {
      const payload = rawResult.data;

      if (Array.isArray(payload)) {
        return {
          ...rawResult,
          data: payload,
        };
      }

      if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
        return {
          success: true,
          data: payload.data,
          message: rawResult.message,
          status: rawResult.status,
        };
      }
    }
  } catch {
    // Fall back to the WooCommerce REST API path below.
  }

  try {
    const url = new URL(
      "/wp-json/wc/v3/products/reviews",
      `${getWooBaseUrl()}/`,
    );

    url.searchParams.set("product", String(productId));
    url.searchParams.set("per_page", "100");
    url.searchParams.set("orderby", "date");
    url.searchParams.set("order", "desc");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: getAuthHeader(),
      },
      next: { revalidate: 300, tags: [`product-reviews-${productId}`] },
    });

    const result = await parseResponse<WooProductReview[]>(response);

    return {
      ...result,
      data:
        result.success && Array.isArray(result.data)
          ? result.data.map(mapReview)
          : [],
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "Unable to load product reviews.",
    };
  }
}

export async function createProductReview(
  input: CreateProductReviewInput,
): Promise<ApiResponse<ProductReview>> {
  if (input.authToken) {
    try {
      const url = new URL(
        `/wp-json/lunex/v1/products/${input.productId}/review`,
        `${getWooBaseUrl()}/`,
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${input.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review: input.review,
          rating: input.rating,
          reviewer: input.reviewer,
        }),
        cache: "no-store",
      });

      const rawResult = await parseResponse<{ success?: boolean; data?: ProductReview; message?: string } | ProductReview>(response);

      if (rawResult.success) {
        const payload = rawResult.data as { success?: boolean; data?: ProductReview; message?: string } | ProductReview;

        if (payload && typeof payload === "object" && "success" in payload) {
          return {
            success: Boolean(payload.success),
            data: payload.data as ProductReview,
            message: payload.message || rawResult.message,
            status: rawResult.status,
          };
        }

        return rawResult as ApiResponse<ProductReview>;
      }
    } catch {
      // Fall back to the WooCommerce REST API path below.
    }
  }

  try {
    const url = new URL(
      "/wp-json/wc/v3/products/reviews",
      `${getWooBaseUrl()}/`,
    );

    const payload: Record<string, string | number> = {
      product_id: input.productId,
      review: input.review,
      reviewer: input.reviewer,
      rating: input.rating,
    };

    if (input.reviewerEmail) {
      payload.reviewer_email = input.reviewerEmail;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await parseResponse<WooProductReview>(response);

    return {
      ...result,
      data: result.success ? mapReview(result.data) : (null as unknown as ProductReview),
    };
  } catch (error) {
    return {
      success: false,
      data: null as unknown as ProductReview,
      message:
        error instanceof Error
          ? error.message
          : "Unable to submit product review.",
    };
  }
}
