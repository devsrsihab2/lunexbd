/**
 * CartSummary.test.tsx
 *
 * Tests the CartSummary component:
 * - Renders empty state when cart has no items
 * - Renders list of cart items, order summary (subtotal, discount, shipping, total)
 * - Updates quantity via callback controls (+ / - buttons)
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartSummary } from "@/components/cart/CartSummary";
import type { Cart } from "@/types/cart.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/services/api/cart.api", () => ({
  getCart: jest.fn(() => Promise.resolve({ success: true, data: null })),
  removeCartItem: jest.fn(),
  updateCartItem: jest.fn(),
}));

const mockCartState = {
  cart: null,
  updatingKey: undefined,
  error: undefined,
};

jest.mock("@/hooks/useCart", () => ({
  useCart: () => mockCartState,
}));

jest.mock("@/store/cart.store", () => ({
  cartStore: {
    getSnapshot: () => mockCartState,
    setState: jest.fn(),
    subscribe: () => () => {},
  },
}));

jest.mock("@/components/cart/CartSummary.module.scss", () => ({
  emptyCart: "emptyCart",
  emptyIcon: "emptyIcon",
  cartPage: "cartPage",
  heading: "heading",
  layout: "layout",
  items: "items",
  item: "item",
  imageBox: "imageBox",
  imageFallback: "imageFallback",
  itemInfo: "itemInfo",
  quantity: "quantity",
  total: "total",
  remove: "remove",
  summary: "summary",
  coupon: "coupon",
  grand: "grand",
  error: "error",
  checkout: "checkout",
}));

import { getCart, removeCartItem, updateCartItem } from "@/services/api/cart.api";
const mockGetCart = getCart as jest.Mock;
const mockRemoveCartItem = removeCartItem as jest.Mock;
const mockUpdateCartItem = updateCartItem as jest.Mock;

const mockCartData: Cart = {
  items: [
    {
      key: "item-1",
      productId: 101,
      name: "Luxury Leather Handbag",
      quantity: 1,
      price: "500",
      total: "500",
      images: [],
    },
  ],
  coupons: [],
  totals: {
    subtotal: "500",
    discount: "50",
    shipping: "0",
    tax: "0",
    total: "450",
  },
};

describe("CartSummary component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when cart is empty", () => {
    render(<CartSummary cart={null} />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("renders cart summary tables, discounts, and item details", () => {
    render(<CartSummary cart={mockCartData} />);
    expect(screen.getByText("Luxury Leather Handbag")).toBeInTheDocument();
    expect(screen.getByText("1 items in your cart")).toBeInTheDocument();
    expect(screen.getByText("৳ 450")).toBeInTheDocument(); // total price
    expect(screen.getByText("-৳ 50")).toBeInTheDocument();  // discount
  });

  it("triggers quantity update on '+' button click", async () => {
    mockUpdateCartItem.mockResolvedValueOnce({ success: true, data: mockCartData });
    render(<CartSummary cart={mockCartData} />);

    const incrementBtn = screen.getByRole("button", { name: "+" });
    fireEvent.click(incrementBtn);

    expect(mockUpdateCartItem).toHaveBeenCalledWith("item-1", 2);
  });
});
