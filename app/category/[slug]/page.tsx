import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { getCategoryBySlug, getCategoryProducts } from "@/services/api/categories.api";
import type { ProductQuery } from "@/types/product.types";
import { createMetadata } from "@/utils/seo";
import styles from "../../products/products.module.scss";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Pick<CategoryPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  return createMetadata({
    title: category.success ? category.data.name : "Category",
    description: category.success ? category.data.description : undefined,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const productQuery: ProductQuery = {
    ...(query as ProductQuery),
    category: slug,
    page: "1",
    per_page: "8",
  };
  const [category, products] = await Promise.all([getCategoryBySlug(slug), getCategoryProducts(slug, productQuery)]);

  if (!category.success && category.message?.toLowerCase().includes("not found")) notFound();

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Category</span>
          <h1>{category.data?.name || "Category"}</h1>
          {category.data?.description ? <p>{category.data.description}</p> : null}
        </div>
      </section>
      <div className={styles.inner}>
        <ProductListing initialProducts={products} initialQuery={productQuery} />
      </div>
    </div>
  );
}
