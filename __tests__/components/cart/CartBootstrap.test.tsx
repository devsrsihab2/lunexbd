/**
 * CartBootstrap.test.tsx
 *
 * Tests the CartBootstrap component:
 * - Boots the cart store on initial mount
 * - Triggers getCart request and sets the returned payload into cartStore
 */
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { CartBootstrap } from "@/components/cart/CartBootstrap";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/services/api/cart.api", () => ({
  getCart: jest.fn(() => Promise.resolve({ success: true, data: { items: [] } })),
}));

jest.mock("@/store/cart.store", () => {
  return {
    cartStore: {
      getSnapshot: jest.fn(() => ({ cart: null, loading: false })),
      setState: jest.fn(),
      subscribe: jest.fn(),
    },
  };
});

import { getCart } from "@/services/api/cart.api";
const mockGetCart = getCart as jest.Mock;

import { cartStore } from "@/store/cart.store";

describe("CartBootstrap component", () => {
  it("boots the cart store and fetches initial cart items", async () => {
    render(<CartBootstrap />);
    
    expect(cartStore.setState).toHaveBeenCalledWith(expect.objectContaining({ loading: true }));
    expect(mockGetCart).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(cartStore.setState).toHaveBeenLastCalledWith({
        cart: { items: [] },
        loading: false,
        error: undefined,
      });
    });
  });
});
