"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { getProducts } from "@/services/api/products.api";
import type { ApiResponse } from "@/types/api.types";
import type { Product, ProductQuery } from "@/types/product.types";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";
import styles from "./ProductListing.module.scss";

const PRODUCTS_PER_PAGE = "8";

type ProductListingProps = {
  initialProducts: ApiResponse<Product[]>;
  initialQuery: ProductQuery;
};

function cleanQuery(query: ProductQuery) {
  const next: ProductQuery = {};

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      next[key] = value;
    }
  });

  return next;
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

function isEmptyProductResponse(response: ApiResponse<Product[]>) {
  const message = response.message?.toLowerCase() || "";

  return (
    !response.success &&
    (message.includes("not found") ||
      message.includes("no product") ||
      message.includes("no products") ||
      message.includes("empty") ||
      message.includes("not available"))
  );
}

function normalizeProductResponse(
  response: ApiResponse<Product[]>,
): ApiResponse<Product[]> {
  if (response.success) return response;

  if (isEmptyProductResponse(response)) {
    return {
      success: true,
      data: [],
      message: "",
      pagination: {
        page: 1,
        perPage: Number(PRODUCTS_PER_PAGE),
        total: 0,
        totalPages: 1,
      },
    };
  }

  return response;
}

export function ProductListing({
  initialProducts,
  initialQuery,
}: ProductListingProps) {
  const normalizedInitialProducts = useMemo(
    () => normalizeProductResponse(initialProducts),
    [initialProducts],
  );

  const baseQuery = useMemo<ProductQuery>(
    () =>
      cleanQuery({
        category: initialQuery.category || "",
        search: initialQuery.search || "",
        sort: initialQuery.sort || "latest",
        min_price: initialQuery.min_price || "",
        max_price: initialQuery.max_price || "",
        stock_status: initialQuery.stock_status || "",
      }),
    [initialQuery],
  );

  const [filters, setFilters] = useState<ProductQuery>(baseQuery);
  const [products, setProducts] = useState<Product[]>(
    normalizedInitialProducts.success ? normalizedInitialProducts.data : [],
  );
  const [page, setPage] = useState(
    normalizedInitialProducts.pagination?.page || 1,
  );
  const [totalProducts, setTotalProducts] = useState(
    normalizedInitialProducts.pagination?.total || products.length,
  );
  const [totalPages, setTotalPages] = useState(
    normalizedInitialProducts.pagination?.totalPages || 1,
  );
  const [message, setMessage] = useState(
    normalizedInitialProducts.success
      ? ""
      : normalizedInitialProducts.message || "Products unavailable.",
  );
  const [loadingMode, setLoadingMode] = useState<"filter" | "more" | null>(
    null,
  );

  const requestId = useRef(0);
  const hydrated = useRef(false);

  const hasMore = page < totalPages;
  const isFiltering = loadingMode === "filter";
  const isLoadingMore = loadingMode === "more";

  const loadProducts = useCallback(
    (query: ProductQuery, nextPage = 1, append = false) => {
      const id = requestId.current + 1;
      requestId.current = id;

      setLoadingMode(append ? "more" : "filter");
      if (!append) setMessage("");

      void (async () => {
        const rawResponse = await getProducts({
          ...cleanQuery(query),
          page: String(nextPage),
          per_page: PRODUCTS_PER_PAGE,
        });

        const response = normalizeProductResponse(rawResponse);

        if (id !== requestId.current) return;

        setLoadingMode(null);

        if (!response.success) {
          setMessage(response.message || "Products unavailable.");

          if (!append) {
            setProducts([]);
            setPage(1);
            setTotalProducts(0);
            setTotalPages(1);
          }

          return;
        }

        setMessage("");
        setProducts((current) =>
          append ? [...current, ...response.data] : response.data,
        );
        setPage(response.pagination?.page || nextPage);
        setTotalProducts(response.pagination?.total || response.data.length);
        setTotalPages(response.pagination?.totalPages || 1);
      })();
    },
    [],
  );

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      loadProducts(filters, 1, false);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [filters, loadProducts]);

  function handleFiltersChange(nextFilters: ProductQuery) {
    setFilters(cleanQuery(nextFilters));
  }

  function handleReset() {
    setFilters(
      cleanQuery({ category: initialQuery.category || "", sort: "latest" }),
    );
  }

  function handleLoadMore() {
    loadProducts(filters, page + 1, true);
  }

  return (
    <>
      <section className={styles.toolbar}>
        <div>
          <h2>
            {filters.search
              ? "Matching Products"
              : filters.category
                ? "Category Products"
                : "All Products"}
          </h2>
          <p>
            Filter by keyword, price and availability to find the right product
            faster.
          </p>
        </div>

        <strong className={styles.count}>
          {message ? "Products unavailable" : countLabel(totalProducts)}
        </strong>
      </section>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <ProductFilters
            values={filters}
            onChange={handleFiltersChange}
            onReset={handleReset}
          />
        </aside>

        <section className={styles.content}>
          <div className={styles.resultBar}>
            <span>
              {filters.search
                ? `Search: ${filters.search}`
                : filters.category
                  ? `Category: ${filters.category.replaceAll("-", " ")}`
                  : "All products"}
            </span>

            <span>
              {filters.sort
                ? `Sorted by ${filters.sort.replace("_", " ")}`
                : "View All"}
            </span>
          </div>

          {message ? (
            <ErrorState message={message} retryHref="/products" />
          ) : isFiltering ? (
            <ProductSkeletonGrid />
          ) : (
            <>
              <ProductGrid products={products} variant="listing" />

              <div className={styles.loadMoreWrap}>
                {hasMore ? (
                  <button
                    type="button"
                    className={styles.loadMore}
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <span className={styles.spinner} aria-hidden="true" />{" "}
                        Loading...
                      </>
                    ) : (
                      "Load more"
                    )}
                  </button>
                ) : products.length ? (
                  <p className={styles.endText}>
                    You have viewed all products.
                  </p>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className={styles.skeletonGrid} aria-live="polite" aria-busy="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className={styles.skeletonCard} key={index}>
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
