/**
 * AllProductsSection.test.tsx
 *
 * Tests the AllProductsSection component:
 * - Renders the initial products using ProductGrid
 * - Conditionally displays "Load More" button
 * - Fetches more products on button click and appends them
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AllProductsSection } from "@/components/home/AllProductsSection";
import type { Product } from "@/types/product.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/components/product/ProductGrid", () => ({
  ProductGrid: ({ products }: { products: Product[] }) => (
    <div data-testid="product-grid">
      {products.map((p) => (
        <span key={p.id}>{p.name}</span>
      ))}
    </div>
  ),
}));

jest.mock("@/services/api/products.api", () => ({
  getProducts: jest.fn(),
}));

jest.mock("@/components/home/AllProductsSection.module.scss", () => ({
  section: "section",
  header: "header",
  eyebrow: "eyebrow",
  error: "error",
  action: "action",
  loadMore: "loadMore",
}));

import { getProducts } from "@/services/api/products.api";
const mockGetProducts = getProducts as jest.Mock;

const mockProducts: Product[] = [
  { id: 1, name: "Bag A", price: "10" },
  { id: 2, name: "Bag B", price: "20" },
] as unknown as Product[];

describe("AllProductsSection component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders products inside ProductGrid and does not show Load More if there are no more products", () => {
    render(
      <AllProductsSection
        initialProducts={mockProducts}
        initialPagination={{ page: 1, totalPages: 1, total: 2 }}
      />
    );
    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
    expect(screen.getByText("Bag A")).toBeInTheDocument();
    expect(screen.getByText("Bag B")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load More" })).not.toBeInTheDocument();
  });

  it("renders Load More button when total products is larger than per_page", () => {
    render(
      <AllProductsSection
        initialProducts={mockProducts}
        initialPagination={{ page: 1, totalPages: 2, total: 10 }}
      />
    );
    expect(screen.getByRole("button", { name: "Load More" })).toBeInTheDocument();
  });

  it("loads more products and updates state on button click", async () => {
    mockGetProducts.mockResolvedValueOnce({
      success: true,
      data: [{ id: 3, name: "Bag C", price: "30" }],
      pagination: { page: 2, totalPages: 2, total: 10 },
    });

    render(
      <AllProductsSection
        initialProducts={mockProducts}
        initialPagination={{ page: 1, totalPages: 2, total: 10 }}
      />
    );

    const btn = screen.getByRole("button", { name: "Load More" });
    fireEvent.click(btn);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Bag C")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: "Load More" })).not.toBeInTheDocument();
  });

  it("shows error alert when load more API request fails", async () => {
    mockGetProducts.mockResolvedValueOnce({
      success: false,
      message: "Network Error",
    });

    render(
      <AllProductsSection
        initialProducts={mockProducts}
        initialPagination={{ page: 1, totalPages: 2, total: 10 }}
      />
    );

    const btn = screen.getByRole("button", { name: "Load More" });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });
});
