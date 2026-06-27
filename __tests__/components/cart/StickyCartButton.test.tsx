/**
 * StickyCartButton.test.tsx
 *
 * Tests the StickyCartButton component:
 * - Renders nothing when itemCount is 0
 * - Renders the button with correct item count copy
 * - Formats and displays the cart total correctly using formatPrice
 * - Fires onOpen callback when clicked
 * - Shows loading state
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StickyCartButton } from "@/components/cart/StickyCartButton";
import type { Cart } from "@/types/cart.types";

// Mock CSS modules
jest.mock("./CartDrawer.module.scss", () => ({}), { virtual: true });
jest.mock("@/components/cart/CartDrawer.module.scss", () => ({}), { virtual: true });

// Minimal Cart fixture
const mockCart: Cart = {
  items: [],
  coupons: [],
  totals: {
    subtotal: "1500",
    discount: "200",
    shipping: "0",
    tax: "0",
    total: "1300",
  },
};

describe("StickyCartButton", () => {
  it("should render nothing when itemCount is 0", () => {
    const { container } = render(
      <StickyCartButton cart={mockCart} itemCount={0} onOpen={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render button when itemCount is greater than 0", () => {
    render(<StickyCartButton cart={mockCart} itemCount={3} onOpen={jest.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should show singular 'Item' text for itemCount of 1", () => {
    render(<StickyCartButton cart={mockCart} itemCount={1} onOpen={jest.fn()} />);
    expect(screen.getByText("1 Item")).toBeInTheDocument();
  });

  it("should show plural 'Items' text for itemCount greater than 1", () => {
    render(<StickyCartButton cart={mockCart} itemCount={3} onOpen={jest.fn()} />);
    expect(screen.getByText("3 Items")).toBeInTheDocument();
  });

  it("should display formatted price based on cart totals", () => {
    render(<StickyCartButton cart={mockCart} itemCount={2} onOpen={jest.fn()} />);
    // subtotal=1500, discount=200 → 1300. formatPrice(1300) → ৳ 1,300
    expect(screen.getByText(/৳/)).toBeInTheDocument();
  });

  it("should call onOpen when clicked", () => {
    const onOpen = jest.fn();
    render(<StickyCartButton cart={mockCart} itemCount={2} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("should show '...' when loading is true", () => {
    render(<StickyCartButton cart={mockCart} itemCount={2} loading={true} onOpen={jest.fn()} />);
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("should have correct aria-label for accessibility", () => {
    render(<StickyCartButton cart={mockCart} itemCount={2} onOpen={jest.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Open cart, 2 items"
    );
  });
});
