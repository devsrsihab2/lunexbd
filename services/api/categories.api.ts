import { apiFetch } from "./http";
import type { Category } from "@/types/category.types";
import type { ProductQuery } from "@/types/product.types";
import type { Product } from "@/types/product.types";
import type { ApiResponse } from "@/types/api.types";
import { getPublicWooProducts } from "./products.api";

type WooStoreCategory = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  count?: number;
  image?: { src?: string; alt?: string } | string | null;
};

function mapWooCategory(category: WooStoreCategory): Category {
  const imageSrc = typeof category.image === "string" ? category.image : category.image?.src;
  const imageAlt = typeof category.image === "string" ? category.name : category.image?.alt;

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    count: category.count,
    image: imageSrc ? { src: imageSrc, alt: imageAlt } : undefined,
  };
}

function mergeCategories(primary: Category[], fallback: Category[]) {
  const items = new Map<string, Category>();

  [...fallback, ...primary].forEach((category) => {
    items.set(category.slug, {
      ...items.get(category.slug),
      ...category,
    });
  });

  return Array.from(items.values());
}

export async function getCategories() {
  const [storeResponse, featuredResponse] = await Promise.all([
    apiFetch<WooStoreCategory[]>("/wc/store/v1/products/categories", { cache: "no-store" }),
    apiFetch<WooStoreCategory[]>("/lunex/v1/featured-categories", { cache: "no-store" }),
  ]);

  const storeCategories = storeResponse.success ? storeResponse.data.map(mapWooCategory) : [];
  const featuredCategories = featuredResponse.success ? featuredResponse.data.map(mapWooCategory) : [];

  return {
    ...storeResponse,
    success: storeResponse.success || featuredResponse.success,
    data: mergeCategories(storeCategories, featuredCategories),
    message: storeResponse.success ? storeResponse.message : featuredResponse.message,
  };
}

export async function getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
  const cleanSlug = decodeURIComponent(slug).trim();
  const response = await getCategories();
  const category = response.data.find((item) => item.slug === cleanSlug);

  if (!response.success) {
    return { ...response, data: null as unknown as Category };
  }

  if (!category) {
    return {
      success: false,
      data: null as unknown as Category,
      message: "Category not found.",
    };
  }

  return {
    success: true,
    data: category,
  };
}

export function getCategoryProducts(slug: string, query: ProductQuery = {}): Promise<ApiResponse<Product[]>> {
  return getPublicWooProducts({ ...query, category: slug });
}
