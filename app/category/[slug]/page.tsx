import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import {
  getCategoryBySlug,
  getCategoryProducts,
} from "@/services/api/categories.api";
import type { ApiResponse } from "@/types/api.types";
import type { Product, ProductQuery } from "@/types/product.types";
import { createMetadata } from "@/utils/seo";
import styles from "../../products/products.module.scss";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

function formatCategoryTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function emptyProductsResponse(): ApiResponse<Product[]> {
  return {
    success: true,
    data: [],
    message: "",
    pagination: {
      page: 1,
      perPage: 8,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function generateMetadata({
  params,
}: Pick<CategoryPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  const title = category.success
    ? category.data.name
    : formatCategoryTitle(slug);

  return createMetadata({
    title,
    description: category.success ? category.data.description : undefined,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const productQuery: ProductQuery = {
    ...(query as ProductQuery),
    category: slug,
    page: "1",
    per_page: "8",
  };

  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getCategoryProducts(slug, productQuery),
  ]);

  const categoryName = category.success
    ? category.data.name
    : formatCategoryTitle(slug);
  const categoryDescription = category.success ? category.data.description : "";

  const initialProducts: ApiResponse<Product[]> = products.success
    ? products
    : emptyProductsResponse();

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Category</span>
          <h1>{categoryName}</h1>
          {categoryDescription ? <p>{categoryDescription}</p> : null}
        </div>
      </section>

      <div className={styles.inner}>
        <ProductListing
          initialProducts={initialProducts}
          initialQuery={productQuery}
        />
      </div>
    </div>
  );
}
