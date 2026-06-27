/**
 * CartExperience.test.tsx
 *
 * Tests the CartExperience component:
 * - Syncs cart items count from the store
 * - Displays StickyCartButton and CartSidebar
 * - Triggers open/close drawer states on uiStore state updates
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartExperience } from "@/components/cart/CartExperience";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/hooks/useCart", () => ({
  useCart: () => ({
    cart: {
      items: [
        { key: "item1", productId: 1, name: "Item A", quantity: 3, price: "100", total: "300" },
      ],
    },
    loading: false,
  }),
}));

// Define inline to avoid hoisting issues
jest.mock("@/store/ui.store", () => {
  return {
    uiStore: {
      getSnapshot: jest.fn(() => ({ cartDrawerOpen: false })),
      setState: jest.fn(),
      subscribe: jest.fn(() => () => {}),
    },
  };
});

jest.mock("@/components/cart/StickyCartButton", () => ({
  StickyCartButton: ({ itemCount, onOpen }: any) => (
    <button data-testid="sticky-cart-btn" onClick={onOpen}>
      Cart ({itemCount})
    </button>
  ),
}));

jest.mock("@/components/cart/CartSidebar", () => ({
  CartSidebar: ({ isOpen, onClose }: any) => (
    <div data-testid="cart-sidebar" data-is-open={isOpen}>
      <button data-testid="close-sidebar" onClick={onClose}>
        Close Drawer
      </button>
    </div>
  ),
}));

import { uiStore } from "@/store/ui.store";

describe("CartExperience component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (uiStore.getSnapshot as jest.Mock).mockReturnValue({ cartDrawerOpen: false });
  });

  it("calculates total items count and passes it to components", () => {
    render(<CartExperience />);
    expect(screen.getByTestId("sticky-cart-btn")).toHaveTextContent("Cart (3)");
  });

  it("updates uiStore state to open/close cart sidebar drawer", () => {
    render(<CartExperience />);

    // Click StickyCartButton to open
    const openBtn = screen.getByTestId("sticky-cart-btn");
    fireEvent.click(openBtn);
    expect(uiStore.setState).toHaveBeenCalledWith(
      expect.objectContaining({ cartDrawerOpen: true })
    );

    // Click close button inside sidebar drawer
    const closeBtn = screen.getByTestId("close-sidebar");
    fireEvent.click(closeBtn);
    expect(uiStore.setState).toHaveBeenCalledWith(
      expect.objectContaining({ cartDrawerOpen: false })
    );
  });
});
