"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createProductReview } from "@/services/api/reviews.api";
import type { User } from "@/types/user.types";

export type ReviewFormState = {
  success: boolean;
  message: string;
  errors?: {
    reviewer?: string;
    review?: string;
    rating?: string;
    authToken?: string;
  };
};

const initialMessage = "Your review could not be submitted.";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getWordPressBaseUrl() {
  const baseUrl = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_API_URL;

  if (!baseUrl) {
    throw new Error("WP_BASE_URL or NEXT_PUBLIC_WP_API_URL is not configured.");
  }

  return baseUrl.replace(/\/wp-json\/?$/, "").replace(/\/$/, "");
}

async function getAuthenticatedUser(token: string): Promise<User | null> {
  try {
    const response = await fetch(
      new URL("/wp-json/lunex/v1/me", `${getWordPressBaseUrl()}/`),
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const body = await response.json().catch(() => null);

    if (!response.ok || body?.success === false) {
      return null;
    }

    return (body?.data || body) as User;
  } catch {
    return null;
  }
}

function getReviewerName(user: User, fallback: string) {
  return (
    fallback ||
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email?.split("@")[0] ||
    "Customer"
  );
}

export async function submitProductReview(
  productId: number,
  productSlug: string,
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const reviewer = readText(formData, "reviewer");
  const review = readText(formData, "review");
  const rating = Number(readText(formData, "rating"));
  const authToken = readText(formData, "authToken");
  const loginPath = `/login?redirect=${encodeURIComponent(`/product/${productSlug}#reviews`)}`;

  const errors: ReviewFormState["errors"] = {};

  if (!review) errors.review = "Review is required.";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Select a rating.";
  }

  if (Object.keys(errors).length) {
    return {
      success: false,
      message: "Please complete the required fields.",
      errors,
    };
  }

  if (!authToken) {
    redirect(loginPath);
  }

  const user = await getAuthenticatedUser(authToken);

  if (!user?.email) {
    redirect(loginPath);
  }

  const response = await createProductReview({
    productId,
    reviewer: getReviewerName(user, reviewer),
    reviewerEmail: user.email,
    review,
    rating,
    authToken,
  });

  if (!response.success) {
    return {
      success: false,
      message: response.message || initialMessage,
    };
  }

  revalidateTag(`product-reviews-${productId}`, "max");
  revalidatePath(`/product/${productSlug}`);

  return {
    success: true,
    message: response.message || "Thank you. Your review has been submitted.",
  };
}
