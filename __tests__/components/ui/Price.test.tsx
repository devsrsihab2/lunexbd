/**
 * Price.test.tsx
 *
 * Tests the Price component:
 * - Renders a span containing the formatted price
 * - Delegates formatting to formatPrice utility (BDT by default)
 * - Handles undefined/null gracefully
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Price } from "@/components/ui/Price";

describe("Price component", () => {
  it("should render a span element", () => {
    const { container } = render(<Price value={100} />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("should display formatted BDT price with Taka symbol", () => {
    render(<Price value={1500} />);
    expect(screen.getByText(/৳/)).toBeInTheDocument();
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
  });

  it("should display zero price when value is 0", () => {
    render(<Price value={0} />);
    expect(screen.getByText(/৳/)).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it("should handle undefined value gracefully", () => {
    render(<Price value={undefined} />);
    // formatPrice(undefined) returns '৳ 0'
    expect(screen.getByText(/৳/)).toBeInTheDocument();
  });

  it("should handle string numeric values", () => {
    render(<Price value="2500" />);
    expect(screen.getByText(/2,500/)).toBeInTheDocument();
  });
});
