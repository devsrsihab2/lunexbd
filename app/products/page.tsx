import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import {
  getProductBrands,
  getProductCategories,
  getProducts,
} from "@/services/api/products.api";
import type { ProductQuery } from "@/types/product.types";
import { createMetadata } from "@/utils/seo";
import styles from "./products.module.scss";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Products",
  path: "/products",
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = (await searchParams) as ProductQuery;

  const [products, categories, brands] = await Promise.all([
    getProducts({
      ...query,
      page: "1",
      per_page: "8",
    }),
    getProductCategories(),
    getProductBrands(),
  ]);

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Lunex collection</span>
          <h1>
            {query.search
              ? `Search results for "${query.search}"`
              : "Shop premium bags for every day"}
          </h1>
          <p>
            Explore handbags, wallets, backpacks and travel essentials with fast
            filtering, clear prices and a smoother checkout flow.
          </p>
        </div>
      </section>

      <div className={styles.inner}>
        <ProductListing
          initialProducts={products}
          initialQuery={query}
          categoryOptions={categories.success ? categories.data : []}
          brandOptions={brands.success ? brands.data : []}
        />
      </div>
    </div>
  );
}
