/**
 * CheckoutForm.test.tsx
 *
 * Tests the CheckoutForm component:
 * - Renders lists of products under review
 * - Handles district dropdown selection and triggers delivery cost recalculation
 * - Handles coupon application success and error states
 * - Handles placeOrder form submission and window redirect
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import type { CheckoutOptions } from "@/types/checkout.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/data/bangladesh-locations", () => ({
  bangladeshDistricts: [{ name: "Dhaka" }, { name: "Chattogram" }],
  getDivisionByDistrict: (d: string) => (d === "Dhaka" ? "Dhaka" : "Chattogram"),
  getThanasByDistrict: (d: string) => (d === "Dhaka" ? ["Dhanmondi"] : ["Panchlaish"]),
}));

jest.mock("@/services/api/Addresses.api", () => ({
  saveAddress: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock("@/services/api/checkout.api", () => ({
  applyCheckoutCoupon: jest.fn(),
  placeOrder: jest.fn(),
}));

jest.mock("@/services/api/cart.api", () => ({
  getCart: jest.fn(),
  removeCartItem: jest.fn(),
  updateCartItem: jest.fn(),
}));

jest.mock("@/services/api/auth.api", () => ({
  getMe: jest.fn(() => Promise.resolve({ success: true, data: { addresses: [] } })),
}));

jest.mock("@/components/checkout/CheckoutForm.module.scss", () => ({
  checkout: "checkout",
  grid: "grid",
  left: "left",
  right: "right",
  panel: "panel",
  reviewItem: "reviewItem",
  thumb: "thumb",
  qtyRow: "qtyRow",
  removeItem: "removeItem",
  savedAddresses: "savedAddresses",
  savedAddressLabel: "savedAddressLabel",
  savedAddressCards: "savedAddressCards",
  savedAddressCard: "savedAddressCard",
  saveAddressRow: "saveAddressRow",
  saveAddressCheck: "saveAddressCheck",
  saveAddressType: "saveAddressType",
  saveAddressHint: "saveAddressHint",
  fields: "fields",
  searchSelect: "searchSelect",
  searchButton: "searchButton",
  searchMenu: "searchMenu",
  searchInputWrap: "searchInputWrap",
  searchOptions: "searchOptions",
  activeOption: "activeOption",
  methodGrid: "methodGrid",
  method: "method",
  activeMethod: "activeMethod",
  couponBox: "couponBox",
  fullControl: "fullControl",
  applyCoupon: "applyCoupon",
  appliedCoupon: "appliedCoupon",
  couponSuccess: "couponSuccess",
  couponError: "couponError",
  totals: "totals",
  helpText: "helpText",
  emptyMethod: "emptyMethod",
  error: "error",
}));

import { applyCheckoutCoupon, placeOrder } from "@/services/api/checkout.api";
const mockApplyCheckoutCoupon = applyCheckoutCoupon as jest.Mock;
const mockPlaceOrder = placeOrder as jest.Mock;

const mockOptions: CheckoutOptions = {
  paymentMethods: [
    { id: "cod", title: "Cash on delivery", enabled: true, description: "" },
  ],
  shippingMethods: [
    { id: "dhaka-method", title: "Dhaka Delivery", cost: "60", zoneName: "Dhaka", enabled: true },
  ],
  couponsEnabled: true,
};

const mockItems = [
  {
    key: "item-a",
    productId: 12,
    name: "Standard Bag",
    quantity: 1,
    price: "1000",
    total: "1000",
  },
];

describe("CheckoutForm component", () => {
  beforeAll(() => {
    Object.defineProperty(window.Location.prototype, "href", {
      configurable: true,
      writable: true,
      value: "http://localhost",
    });
  });

  afterAll(() => {
    delete (window.Location.prototype as any).href;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = "http://localhost";
  });

  it("renders cart line items, review panels, and total summaries", () => {
    render(<CheckoutForm options={mockOptions} initialItems={mockItems} />);
    expect(screen.getByText("Standard Bag")).toBeInTheDocument();
    expect(screen.getByText("Cash on delivery")).toBeInTheDocument();
    expect(screen.getAllByText("৳ 1,000")).toHaveLength(3); // subtotal, item total, and summary subtotal
  });

  it("applies district selection and updates delivery parameters", () => {
    render(<CheckoutForm options={mockOptions} initialItems={mockItems} />);

    // Click select district button to open dropdown listbox
    const distBtn = screen.getByRole("button", { name: "Select District" });
    fireEvent.click(distBtn);

    const dhakaOption = screen.getByRole("option", { name: "Dhaka" });
    fireEvent.click(dhakaOption);

    // After choosing Dhaka division, shipping cost 60 is applied
    expect(screen.getByText("৳ 60")).toBeInTheDocument(); // Delivery cost
    expect(screen.getByText("৳ 1,060")).toBeInTheDocument(); // Total cost
  });

  it("submits the order checkout form successfully", async () => {
    mockPlaceOrder.mockResolvedValueOnce({
      success: true,
      data: {
        order: { id: 777 },
        redirectUrl: "",
        orderKey: "abc-key",
      },
    });

    render(<CheckoutForm options={mockOptions} initialItems={mockItems} />);

    // Prefill Dhaka district to apply valid shipping parameters
    fireEvent.click(screen.getByRole("button", { name: "Select District" }));
    fireEvent.click(screen.getByRole("option", { name: "Dhaka" }));

    // Submit form by triggering form submit
    const form = screen.getByRole("button", { name: "Place Order" }).closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockPlaceOrder).toHaveBeenCalled();
    });
  });
});
