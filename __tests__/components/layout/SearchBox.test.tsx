/**
 * SearchBox.test.tsx
 *
 * Tests the SearchBox component:
 * - Renders input and button
 * - Expands/collapses search panel correctly
 * - Performs debounced API query on input change (typing >= 2 chars)
 * - Displays loading, suggestions, or no results state
 * - Triggers redirect on form submit
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { SearchBox } from "@/components/layout/SearchBox";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/services/api/products.api", () => ({
  getProducts: jest.fn(),
}));

jest.mock("@/components/layout/Header.module.scss", () => ({
  searchForm: "searchForm",
  mobileSearch: "mobileSearch",
  searchOpen: "searchOpen",
  searchClosing: "searchClosing",
  searchDocked: "searchDocked",
  mobileSearchHead: "mobileSearchHead",
  mobileSearchClose: "mobileSearchClose",
  searchSubmitButton: "searchSubmitButton",
  suggestions: "suggestions",
  suggestionState: "suggestionState",
  suggestionItem: "suggestionItem",
  suggestionImage: "suggestionImage",
  suggestionText: "suggestionText",
  viewResults: "viewResults",
}));

import { getProducts } from "@/services/api/products.api";
const mockGetProducts = getProducts as jest.Mock;

describe("SearchBox component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders input and search button", () => {
    render(<SearchBox id="search-test" icon={<span>🔍</span>} />);
    expect(screen.getByPlaceholderText("Search in...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open search" })).toBeInTheDocument();
  });

  it("opens the search input focus on submit when not activeOpen", () => {
    render(<SearchBox id="search-test" icon={<span>🔍</span>} />);
    const btn = screen.getByRole("button", { name: "Open search" });
    fireEvent.click(btn);
    // Becomes activeOpen, expect aria-label changes or focuses
    expect(screen.getByRole("button", { name: "Search products" })).toBeInTheDocument();
  });

  it("does not fetch suggestions when query length is less than 2", () => {
    render(<SearchBox id="search-test" icon={<span>🔍</span>} alwaysOpen />);
    const input = screen.getByPlaceholderText("Search in...");
    fireEvent.change(input, { target: { value: "a" } });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockGetProducts).not.toHaveBeenCalled();
  });

  it("fetches suggestions and displays loading/results when typing >= 2 chars", async () => {
    mockGetProducts.mockResolvedValueOnce({
      success: true,
      data: [{ id: 1, name: "Luxury Bag", slug: "luxury-bag", price: 1500, images: [] }],
    });

    render(<SearchBox id="search-test" icon={<span>🔍</span>} alwaysOpen />);
    const input = screen.getByPlaceholderText("Search in...");
    fireEvent.change(input, { target: { value: "bag" } });

    // Advance debounce timer (220ms)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(screen.getByText("Searching...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Luxury Bag")).toBeInTheDocument();
    });
  });

  it("displays no products found state on failed/empty response", async () => {
    mockGetProducts.mockResolvedValueOnce({ success: true, data: [] });

    render(<SearchBox id="search-test" icon={<span>🔍</span>} alwaysOpen />);
    const input = screen.getByPlaceholderText("Search in...");
    fireEvent.change(input, { target: { value: "shoes" } });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    await waitFor(() => {
      expect(screen.getByText("No products found")).toBeInTheDocument();
    });
  });

  it("redirects to search page on form submission", () => {
    render(<SearchBox id="search-test" icon={<span>🔍</span>} alwaysOpen />);
    const input = screen.getByPlaceholderText("Search in...");
    fireEvent.change(input, { target: { value: "leather" } });
    
    const form = input.closest("form");
    fireEvent.submit(form!);

    expect(mockPush).toHaveBeenCalledWith("/products?search=leather");
  });
});
