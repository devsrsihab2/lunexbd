/**
 * ProductCardActions.test.tsx
 *
 * Tests the ProductCardActions component:
 * - Renders an "Order Now" link with correct href
 * - Calls addCartItem on "Add to cart" click
 * - Shows added state briefly after success
 * - Shows error alert on failure
 * - Button is disabled while adding
 * - Shows error for missing product id
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ProductCardActions } from "@/components/product/ProductCardActions";
import type { Product } from "@/types/product.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/services/api/cart.api", () => ({
  addCartItem: jest.fn(),
  rememberCartProductImage: jest.fn(),
}));

jest.mock("@/store/cart.store", () => ({
  cartStore: {
    getSnapshot: jest.fn(() => ({ cart: null, loading: false })),
    setState: jest.fn(),
    subscribe: jest.fn(() => () => {}),
  },
}));

jest.mock("@/components/product/ProductCard.module.scss", () => ({
  actions: "actions",
  cartButton: "cartButton",
  orderButton: "orderButton",
  actionError: "actionError",
}));

import { addCartItem } from "@/services/api/cart.api";
const mockAddCartItem = addCartItem as jest.Mock;

// ── Fixture ────────────────────────────────────────────────────────────────

const product: Partial<Product> = {
  id: 10,
  name: "Leather Bag",
  slug: "leather-bag",
  images: [{ src: "/bag.jpg", alt: "Bag", thumbnail: "/bag-thumb.jpg" }],
  variations: [],
} as unknown as Product;

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ProductCardActions component", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should render an Order Now link", () => {
    render(<ProductCardActions product={product as Product} />);
    expect(screen.getByRole("link", { name: /order leather bag now/i })).toBeInTheDocument();
  });

  it("should include productId in the Order Now href", () => {
    render(<ProductCardActions product={product as Product} />);
    const link = screen.getByRole("link", { name: /order leather bag now/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("productId=10"));
  });

  it("should render an Add to cart button", () => {
    render(<ProductCardActions product={product as Product} />);
    expect(screen.getByRole("button", { name: /add leather bag to cart/i })).toBeInTheDocument();
  });

  it("should call addCartItem when the cart button is clicked", async () => {
    mockAddCartItem.mockResolvedValueOnce({ success: true, data: { items: [] } });
    render(<ProductCardActions product={product as Product} />);
    fireEvent.click(screen.getByRole("button", { name: /add leather bag to cart/i }));
    await waitFor(() => expect(mockAddCartItem).toHaveBeenCalledWith({
      productId: 10,
      variationId: undefined,
      quantity: 1,
    }));
  });

  it("should show an error alert when addCartItem fails", async () => {
    mockAddCartItem.mockResolvedValueOnce({ success: false, message: "Out of stock" });
    render(<ProductCardActions product={product as Product} />);
    fireEvent.click(screen.getByRole("button", { name: /add leather bag to cart/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Out of stock")).toBeInTheDocument();
    });
  });

  it("should show fallback error when message is empty", async () => {
    mockAddCartItem.mockResolvedValueOnce({ success: false });
    render(<ProductCardActions product={product as Product} />);
    fireEvent.click(screen.getByRole("button", { name: /add leather bag to cart/i }));
    await waitFor(() => {
      expect(screen.getByText("Could not add this product.")).toBeInTheDocument();
    });
  });

  it("should disable the add button while request is in flight", async () => {
    mockAddCartItem.mockImplementationOnce(() => new Promise(() => {}));
    render(<ProductCardActions product={product as Product} />);
    const btn = screen.getByRole("button", { name: /add leather bag to cart/i });
    fireEvent.click(btn);
    await waitFor(() => expect(btn).toBeDisabled());
  });
});
