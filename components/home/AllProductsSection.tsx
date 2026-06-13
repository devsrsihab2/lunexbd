"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/services/api/products.api";
import type { Product } from "@/types/product.types";
import styles from "./AllProductsSection.module.scss";

type PaginationInfo = {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
};

type AllProductsSectionProps = {
  initialProducts: Product[];
  initialPagination?: PaginationInfo;
};

const PER_PAGE = 8;

export function AllProductsSection({
  initialProducts,
  initialPagination,
}: AllProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [currentPage, setCurrentPage] = useState(initialPagination?.page || 1);
  const [totalPages, setTotalPages] = useState(
    initialPagination?.totalPages || 1,
  );
  const [totalProducts, setTotalProducts] = useState(
    initialPagination?.total || initialProducts?.length || 0,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const hasMore =
    totalProducts > PER_PAGE &&
    products.length < totalProducts &&
    currentPage < totalPages;

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError("");

    const nextPage = currentPage + 1;

    const response = await getProducts({
      sort: "latest",
      page: String(nextPage),
      per_page: String(PER_PAGE),
    });

    if (!response.success) {
      setError(response.message || "Unable to load more products.");
      setIsLoading(false);
      return;
    }

    setProducts((currentProducts) => [...currentProducts, ...response.data]);
    setCurrentPage(response.pagination?.page || nextPage);
    setTotalPages(response.pagination?.totalPages || totalPages);
    setTotalProducts(response.pagination?.total || totalProducts);
    setIsLoading(false);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Explore more</span>
          <h2>All Products</h2>
          <p>Browse all available products from our latest collection.</p>
        </div>
      </div>

      <ProductGrid products={products} />

      {error ? <p className={styles.error}>{error}</p> : null}

      {hasMore ? (
        <div className={styles.action}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
