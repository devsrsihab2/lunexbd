/**
 * VariationSelector.test.tsx
 *
 * Tests the VariationSelector component:
 * - Returns null when the product has no variation attributes
 * - Renders a <select> for each variation attribute
 * - The "Add to cart" button is disabled until a variation is fully selected
 * - The "Add to cart" button becomes enabled when a matching variation is chosen
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VariationSelector } from "@/components/product/VariationSelector";
import type { Product } from "@/types/product.types";

// ── Mocks ─────────────────────────────────────────────────────────────────

jest.mock("@/components/ui/Button.module.scss", () => ({}));
jest.mock("@/components/ui/Form.module.scss", () => ({}));

// Mock Select so it renders a native <select> and forwards onChange correctly
jest.mock("@/components/ui/Select", () => ({
  Select: ({ label, value, onChange, options }: any) => (
    <label>
      {label}
      <select aria-label={label} value={value} onChange={onChange}>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));

jest.mock("@/components/ui/Button", () => ({
  Button: ({ children, disabled, ...props }: any) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────

const simpleProduct: Partial<Product> = {
  id: 1,
  type: "simple",
  attributes: [],
  variations: [],
};

const variableProduct: Partial<Product> = {
  id: 2,
  type: "variable",
  attributes: [
    { name: "Size", variation: true, options: ["S", "M", "L"] },
    { name: "Color", variation: true, options: ["Red", "Blue"] },
  ],
  variations: [
    { id: 10, attributes: { Size: "M", Color: "Red" }, price: "500", stockStatus: "In stock" },
    { id: 11, attributes: { Size: "L", Color: "Blue" }, price: "600", stockStatus: "In stock" },
  ],
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe("VariationSelector component", () => {
  it("should return null when product has no variation attributes", () => {
    const { container } = render(
      <VariationSelector product={simpleProduct as Product} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render a select for each variation attribute", () => {
    render(<VariationSelector product={variableProduct as Product} />);
    expect(screen.getByLabelText("Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Color")).toBeInTheDocument();
  });

  it("should render options for each attribute value", () => {
    render(<VariationSelector product={variableProduct as Product} />);
    // Size options (plus the placeholder "Choose Size")
    expect(screen.getByRole("option", { name: "S" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "M" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "L" })).toBeInTheDocument();
  });

  it("should disable 'Add to cart' when no variation is selected", () => {
    render(<VariationSelector product={variableProduct as Product} />);
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeDisabled();
  });

  it("should enable 'Add to cart' when a matching variation is fully selected", () => {
    render(<VariationSelector product={variableProduct as Product} />);

    fireEvent.change(screen.getByLabelText("Size"), { target: { value: "M" } });
    fireEvent.change(screen.getByLabelText("Color"), { target: { value: "Red" } });

    expect(screen.getByRole("button", { name: /add to cart/i })).not.toBeDisabled();
  });

  it("should keep 'Add to cart' disabled when only one attribute is selected", () => {
    render(<VariationSelector product={variableProduct as Product} />);

    fireEvent.change(screen.getByLabelText("Size"), { target: { value: "M" } });
    // Color not selected yet

    expect(screen.getByRole("button", { name: /add to cart/i })).toBeDisabled();
  });
});
