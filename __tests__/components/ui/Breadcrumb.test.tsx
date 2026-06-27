/**
 * Breadcrumb.test.tsx
 *
 * Tests the Breadcrumb component:
 * - Renders a <nav> with aria-label="Breadcrumb"
 * - Renders a link for each item
 * - Renders separators between items (but not before the first)
 * - Renders with a single item (no separator)
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const items = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "T-Shirts", href: "/products/t-shirts" },
];

describe("Breadcrumb component", () => {
  it("should render a nav element with correct aria-label", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("should render a link for each item", () => {
    render(<Breadcrumb items={items} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent("Home");
    expect(links[1]).toHaveTextContent("Products");
    expect(links[2]).toHaveTextContent("T-Shirts");
  });

  it("should set correct href for each link", () => {
    render(<Breadcrumb items={items} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/products");
    expect(links[2]).toHaveAttribute("href", "/products/t-shirts");
  });

  it("should render separators between items (not before the first)", () => {
    render(<Breadcrumb items={items} />);
    // The separator "/ " appears between items — 2 separators for 3 items
    const separators = screen.getAllByText(/\/\s*/);
    expect(separators).toHaveLength(2);
  });

  it("should render with a single item and no separator", () => {
    render(<Breadcrumb items={[{ label: "Home", href: "/" }]} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByText(/\/\s*/)).not.toBeInTheDocument();
  });
});
