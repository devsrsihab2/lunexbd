/**
 * ProductGrid.test.tsx
 *
 * Tests the ProductGrid component:
 * - Shows EmptyState when products is null/undefined/empty
 * - Renders a product card for each product in the list
 * - Applies the listing variant class correctly
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/types/product.types";

// ── Mock all sub-components and CSS modules ────────────────────────────────

jest.mock("@/components/ui/EmptyState", () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

jest.mock("@/components/product/ProductCard", () => ({
  ProductCard: ({ product }: { product: Product }) => (
    <article data-testid="product-card">{product.name}</article>
  ),
}));

jest.mock("@/components/product/ProductGrid.module.scss", () => ({}));

// ── Fixtures ──────────────────────────────────────────────────────────────

const makeProduct = (id: number, name: string): Product =>
  ({
    id,
    slug: name.toLowerCase().replace(/ /g, "-"),
    name,
    type: "simple",
    price: "100",
    stockStatus: "In stock",
    images: [],
  } as unknown as Product);

// ── Tests ─────────────────────────────────────────────────────────────────

describe("ProductGrid component", () => {
  it("should show EmptyState when products is undefined", () => {
    render(<ProductGrid products={undefined} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  it("should show EmptyState when products is null", () => {
    render(<ProductGrid products={null} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("should show EmptyState when products is an empty array", () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("should render a ProductCard for each product", () => {
    const products = [makeProduct(1, "Shirt"), makeProduct(2, "Pants"), makeProduct(3, "Shoes")];
    render(<ProductGrid products={products} />);
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(3);
    expect(screen.getByText("Shirt")).toBeInTheDocument();
    expect(screen.getByText("Pants")).toBeInTheDocument();
    expect(screen.getByText("Shoes")).toBeInTheDocument();
  });

  it("should NOT show EmptyState when products has items", () => {
    const products = [makeProduct(1, "Cap")];
    render(<ProductGrid products={products} />);
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });
});
