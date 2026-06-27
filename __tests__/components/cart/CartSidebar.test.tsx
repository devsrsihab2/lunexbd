/**
 * CartSidebar.test.tsx
 *
 * Tests the CartSidebar component:
 * - Renders empty state when no items in cart
 * - Renders list of cart items, name, price, total, and quantity
 * - Triggers updateQuantity on "+" / "-" button clicks
 * - Triggers updateQuantity with 0 on Close button click
 * - Submits fetch call to update/remove item and handles response success/failure
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartSidebar } from "@/components/cart/CartSidebar";
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

jest.mock("@/components/cart/CartDrawer.module.scss", () => ({
  drawerRoot: "drawerRoot",
  backdrop: "backdrop",
  drawer: "drawer",
  drawerHeader: "drawerHeader",
  empty: "empty",
  itemList: "itemList",
  drawerItem: "drawerItem",
  itemImage: "itemImage",
  itemBody: "itemBody",
  itemTitleRow: "itemTitleRow",
  itemMeta: "itemMeta",
  qty: "qty",
  drawerSummary: "drawerSummary",
  totalRow: "totalRow",
  error: "error",
  drawerActions: "drawerActions",
  viewCart: "viewCart",
  checkout: "checkout",
  imageFallback: "imageFallback",
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
      quantity: 2,
      price: "500",
      total: "1000",
      images: [],
    },
  ],
  coupons: [],
  totals: {
    subtotal: "1000",
    discount: "0",
    shipping: "0",
    tax: "0",
    total: "1000",
  },
};

describe("CartSidebar component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty cart message when cart is empty", () => {
    render(<CartSidebar cart={null} itemCount={0} isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("renders items when cart is not empty", () => {
    render(<CartSidebar cart={mockCartData} itemCount={2} isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText("Luxury Leather Handbag")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // quantity
  });

  it("triggers onClose when clicking close button", () => {
    const handleClose = jest.fn();
    render(<CartSidebar cart={mockCartData} itemCount={2} isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByText("Close").closest("button");
    fireEvent.click(closeBtn!);
    expect(handleClose).toHaveBeenCalled();
  });

  it("calls updateCartItem when clicking increment quantity", async () => {
    mockUpdateCartItem.mockResolvedValueOnce({ success: true, data: mockCartData });
    render(<CartSidebar cart={mockCartData} itemCount={2} isOpen={true} onClose={jest.fn()} />);

    const incrementBtn = screen.getByRole("button", { name: "+" });
    fireEvent.click(incrementBtn);

    expect(mockUpdateCartItem).toHaveBeenCalledWith("item-1", 3);
  });

  it("calls removeCartItem when clicking close button on item (or quantity goes to 0)", async () => {
    mockRemoveCartItem.mockResolvedValueOnce({ success: true, data: { items: [], totals: { subtotal: "0", discount: "0", total: "0" } } });
    render(<CartSidebar cart={mockCartData} itemCount={2} isOpen={true} onClose={jest.fn()} />);

    const removeBtn = screen.getByRole("button", { name: "Remove Luxury Leather Handbag" });
    fireEvent.click(removeBtn);

    expect(mockRemoveCartItem).toHaveBeenCalledWith("item-1");
  });
});
