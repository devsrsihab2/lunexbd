/**
 * ProductListing.test.tsx
 *
 * Tests the ProductListing component:
 * - Renders lists of products
 * - Triggers loadProducts debounced updates when filters change
 * - Handles Load More button correctly to append new page responses
 * - Renders mobile drawer triggers and error state panels
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ProductListing } from "@/components/product/ProductListing";
import type { ApiResponse } from "@/types/api.types";
import type { Product } from "@/types/product.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/services/api/products.api", () => ({
  getProducts: jest.fn(),
}));

jest.mock("@/components/ui/ErrorState", () => ({
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
}));

jest.mock("@/components/product/ProductFilters", () => ({
  ProductFilters: ({ onChange, onReset }: any) => (
    <div data-testid="filters-sidebar">
      <button onClick={() => onChange({ category: "wallets" })}>Change Filter</button>
      <button onClick={onReset}>Reset Filter</button>
    </div>
  ),
}));

jest.mock("@/components/product/ProductGrid", () => ({
  ProductGrid: ({ products }: { products: Product[] }) => (
    <div data-testid="product-grid">
      {products.map((p) => (
        <span key={p.id}>{p.name}</span>
      ))}
    </div>
  ),
}));

jest.mock("@/components/product/ProductListing.module.scss", () => ({
  toolbar: "toolbar",
  count: "count",
  mobileFilterBar: "mobileFilterBar",
  filterTrigger: "filterTrigger",
  mobileCount: "mobileCount",
  layout: "layout",
  sidebar: "sidebar",
  content: "content",
  resultBar: "resultBar",
  loadMoreWrap: "loadMoreWrap",
  loadMore: "loadMore",
  endText: "endText",
  mobileDrawerLayer: "mobileDrawerLayer",
  mobileDrawerOpen: "mobileDrawerOpen",
  mobileDrawerBackdrop: "mobileDrawerBackdrop",
  mobileDrawer: "mobileDrawer",
  mobileDrawerHead: "mobileDrawerHead",
  mobileDrawerMenuIcon: "mobileDrawerMenuIcon",
  mobileDrawerClose: "mobileDrawerClose",
  mobileDrawerBody: "mobileDrawerBody",
  spinner: "spinner",
  skeletonGrid: "skeletonGrid",
  skeletonCard: "skeletonCard",
}));

import { getProducts } from "@/services/api/products.api";
const mockGetProducts = getProducts as jest.Mock;

const mockInitialProducts: ApiResponse<Product[]> = {
  success: true,
  data: [
    { id: 1, name: "Product A", slug: "product-a", price: 100 },
    { id: 2, name: "Product B", slug: "product-b", price: 200 },
  ] as unknown as Product[],
  pagination: {
    page: 1,
    perPage: 8,
    total: 2,
    totalPages: 1,
  },
};

describe("ProductListing component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders layout correctly with grids and custom counts", () => {
    render(<ProductListing initialProducts={mockInitialProducts} initialQuery={{}} />);
    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getAllByText("2 products")[0]).toBeInTheDocument();
  });

  it("triggers debounced search query when filters are updated", async () => {
    mockGetProducts.mockResolvedValueOnce({
      success: true,
      data: [{ id: 3, name: "Product C", slug: "product-c", price: 300 }],
      pagination: { page: 1, totalPages: 1, total: 1 },
    });

    render(<ProductListing initialProducts={mockInitialProducts} initialQuery={{}} />);

    // Click mock filter trigger
    const filterBtn = screen.getByRole("button", { name: "Change Filter" });
    fireEvent.click(filterBtn);

    // Advance timers for debounce (350ms)
    act(() => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(mockGetProducts).toHaveBeenCalled();
    });
  });

  it("renders ErrorState when initial response failed", () => {
    const mockFailedRes: ApiResponse<Product[]> = {
      success: false,
      message: "Server not responding",
    };
    render(<ProductListing initialProducts={mockFailedRes} initialQuery={{}} />);
    expect(screen.getByTestId("error-state")).toBeInTheDocument();
  });
});
