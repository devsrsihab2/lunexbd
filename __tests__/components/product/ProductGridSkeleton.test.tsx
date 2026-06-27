/**
 * ProductGridSkeleton.test.tsx
 *
 * Tests the ProductGridSkeleton component:
 * - Renders correct number of card placeholders (default 8)
 * - Applies listing variation class conditionally
 */
import React from "react";
import { render } from "@testing-library/react";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

jest.mock("@/components/product/ProductGridSkeleton.module.scss", () => ({
  grid: "grid",
  listing: "listing",
  card: "card",
  media: "media",
  body: "body",
  line: "line",
  title: "title",
  price: "price",
  stock: "stock",
  actions: "actions",
  button: "button",
}));

describe("ProductGridSkeleton component", () => {
  it("renders 8 placeholders by default with standard layout styling", () => {
    const { container } = render(<ProductGridSkeleton />);
    const cards = container.querySelectorAll(".card");
    expect(cards).toHaveLength(8);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("grid");
    expect(grid).not.toHaveClass("listing");
  });

  it("renders custom count of placeholders and applies listing layout variant", () => {
    const { container } = render(<ProductGridSkeleton count={4} variant="listing" />);
    const cards = container.querySelectorAll(".card");
    expect(cards).toHaveLength(4);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("listing");
  });
});
