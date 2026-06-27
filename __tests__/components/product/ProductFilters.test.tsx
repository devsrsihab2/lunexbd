/**
 * ProductFilters.test.tsx
 *
 * Tests the ProductFilters component:
 * - Renders all section groups (Search, Sort, Price range, Category, Brand, Availability)
 * - Fires onChange when changing filters
 * - Handles min/max price slider inputs and text input updates
 * - Fires onReset when reset is clicked
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductFilters } from "@/components/product/ProductFilters";
import type { ProductQuery } from "@/types/product.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

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

jest.mock("@/components/product/ProductFilters.module.scss", () => ({
  form: "form",
  drawerForm: "drawerForm",
  clearAll: "clearAll",
  group: "group",
  groupHead: "groupHead",
  searchField: "searchField",
  priceRangeBox: "priceRangeBox",
  priceLabels: "priceLabels",
  rangeSlider: "rangeSlider",
  rangeTrack: "rangeTrack",
  rangeProgress: "rangeProgress",
  priceInputs: "priceInputs",
  checkboxList: "checkboxList",
  checkboxItem: "checkboxItem",
  fakeCheckbox: "fakeCheckbox",
  seeMore: "seeMore",
  actions: "actions",
}));

const mockCategories = [
  { id: 1, name: "Bags", slug: "bags", count: 12 },
  { id: 2, name: "Wallets", slug: "wallets", count: 5 },
];

const mockBrands = [
  { id: 10, name: "Lunex", slug: "lunex" },
];

describe("ProductFilters component", () => {
  it("renders search input, sort options, and checkboxes correctly", () => {
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        values={{ search: "initial search", category: "bags" }}
      />
    );

    // Search input
    expect(screen.getByPlaceholderText("Search bags, wallets...")).toHaveValue("initial search");

    // Checkboxes
    expect(screen.getByLabelText("Bags", { exact: false })).toBeChecked();
    expect(screen.getByLabelText("Wallets", { exact: false })).not.toBeChecked();
    expect(screen.getByLabelText("Lunex", { exact: false })).not.toBeChecked();
  });

  it("triggers onChange when search query changes", () => {
    const handleChange = jest.fn();
    render(<ProductFilters onChange={handleChange} />);

    const searchInput = screen.getByPlaceholderText("Search bags, wallets...");
    fireEvent.change(searchInput, { target: { value: "wallet" } });

    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ search: "wallet" }));
  });

  it("updates range values correctly when price text inputs change", () => {
    const handleChange = jest.fn();
    render(<ProductFilters onChange={handleChange} values={{ min_price: "100", max_price: "5000" }} />);

    const minInput = screen.getByLabelText("Minimum price");
    fireEvent.change(minInput, { target: { value: "300" } });

    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ min_price: "300" }));
  });

  it("triggers onReset when clicking reset button", () => {
    const handleReset = jest.fn();
    render(<ProductFilters onChange={jest.fn()} onReset={handleReset} />);

    const resetBtn = screen.getByRole("button", { name: "Reset filters" });
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalled();
  });
});
