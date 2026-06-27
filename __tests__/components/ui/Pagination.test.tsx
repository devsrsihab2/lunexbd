/**
 * Pagination.test.tsx
 *
 * Tests the Pagination component:
 * - Renders Previous and Next buttons
 * - Renders correct page number buttons
 * - Marks current page with aria-current="page"
 * - Disables Previous on first page
 * - Disables Next on last page
 * - Builds correct hrefs with basePath and query params
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Pagination } from "@/components/ui/Pagination";

// Mock Button so it renders a real <a> and forwards every prop (including aria-current)
jest.mock("@/components/ui/Button", () => ({
  Button: ({ href, children, disabled, ...rest }: any) =>
    href ? (
      <a href={href} aria-disabled={disabled ? "true" : undefined} {...rest}>
        {children}
      </a>
    ) : (
      <button disabled={disabled} {...rest}>
        {children}
      </button>
    ),
}));

// Mock CSS modules
jest.mock("@/components/ui/Button.module.scss", () => ({}));

describe("Pagination component", () => {
  it("should render Previous and Next buttons", () => {
    render(<Pagination page={2} totalPages={5} basePath="/products" />);
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("should render page number buttons", () => {
    render(<Pagination page={1} totalPages={3} basePath="/products" />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should mark current page with aria-current", () => {
    render(<Pagination page={2} totalPages={5} basePath="/products" />);
    // The Link for page 2 should have aria-current="page"
    const pageLinks = screen.getAllByRole("link");
    const currentPage = pageLinks.find(
      (link) => link.getAttribute("aria-current") === "page"
    );
    expect(currentPage).toBeTruthy();
    expect(currentPage?.textContent).toBe("2");
  });

  it("should disable Previous button on the first page", () => {
    render(<Pagination page={1} totalPages={5} basePath="/products" />);
    const prevLink = screen.getByText("Previous").closest("a");
    // Button component renders aria-disabled when disabled
    expect(prevLink).toHaveAttribute("aria-disabled", "true");
  });

  it("should disable Next button on the last page", () => {
    render(<Pagination page={5} totalPages={5} basePath="/products" />);
    const nextLink = screen.getByText("Next").closest("a");
    expect(nextLink).toHaveAttribute("aria-disabled", "true");
  });

  it("should build correct href for a page button", () => {
    render(<Pagination page={1} totalPages={3} basePath="/products" />);
    const page2Link = screen.getByText("2").closest("a");
    expect(page2Link).toHaveAttribute("href", "/products?page=2");
  });

  it("should include query params in page hrefs", () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        basePath="/products"
        query={{ category: "shoes", page: "1" }}
      />
    );
    const page2Link = screen.getByText("2").closest("a");
    expect(page2Link?.getAttribute("href")).toContain("category=shoes");
    expect(page2Link?.getAttribute("href")).toContain("page=2");
  });
});
