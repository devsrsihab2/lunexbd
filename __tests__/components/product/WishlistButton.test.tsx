/**
 * WishlistButton.test.tsx
 *
 * Tests the WishlistButton component:
 * - Renders a button with correct aria-label
 * - Redirects to login when no token in localStorage
 * - Calls addWishlistItem when a token is present
 * - Shows "Saved" label after a successful API response
 * - Is disabled while the save request is in flight
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishlistButton } from "@/components/product/WishlistButton";

// ── Mocks ─────────────────────────────────────────────────────────────────

// Mock the wishlist API
jest.mock("@/services/api/wishlist.api", () => ({
  addWishlistItem: jest.fn(),
}));

// Mock CSS module
jest.mock("@/components/product/ProductCard.module.scss", () => ({
  wishlistButton: "wishlistButton",
  wishlistSaved: "wishlistSaved",
}));

// Mock next/navigation router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────

import { addWishlistItem } from "@/services/api/wishlist.api";
const mockAddWishlistItem = addWishlistItem as jest.Mock;

// ── Tests ─────────────────────────────────────────────────────────────────

describe("WishlistButton component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should render a button with the product name in aria-label", () => {
    render(<WishlistButton productId={1} productName="Cool Shirt" />);
    expect(
      screen.getByRole("button", { name: /cool shirt/i })
    ).toBeInTheDocument();
  });

  it("should redirect to login when no token is present", () => {
    render(<WishlistButton productId={5} productName="Jacket" />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockPush).toHaveBeenCalledWith(
      `/login?redirect=${encodeURIComponent("/wishlist")}`
    );
    expect(mockAddWishlistItem).not.toHaveBeenCalled();
  });

  it("should call addWishlistItem when accessToken is present", async () => {
    localStorage.setItem("accessToken", "test_token");
    mockAddWishlistItem.mockResolvedValueOnce({ success: true });

    render(<WishlistButton productId={7} productName="Sneakers" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(mockAddWishlistItem).toHaveBeenCalledWith(7));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should use fallback 'token' key when 'accessToken' is absent", async () => {
    localStorage.setItem("token", "fallback_token");
    mockAddWishlistItem.mockResolvedValueOnce({ success: true });

    render(<WishlistButton productId={8} productName="Hat" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(mockAddWishlistItem).toHaveBeenCalledWith(8));
  });

  it("should update aria-label to 'Saved' after successful add", async () => {
    localStorage.setItem("accessToken", "tok");
    mockAddWishlistItem.mockResolvedValueOnce({ success: true });

    render(<WishlistButton productId={3} productName="Watch" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /saved watch to wishlist/i })
      ).toBeInTheDocument();
    });
  });

  it("should be disabled while the request is in flight", async () => {
    localStorage.setItem("accessToken", "tok");
    // Never resolves
    mockAddWishlistItem.mockImplementationOnce(() => new Promise(() => {}));

    render(<WishlistButton productId={9} productName="Bag" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
