/**
 * EmptyState.test.tsx
 *
 * Tests the EmptyState component:
 * - Renders the title and message text
 * - Conditionally renders the action button when actionHref + actionLabel are provided
 * - Renders no button when action props are omitted
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/EmptyState";

// Mock CSS modules
jest.mock("@/components/ui/Feedback.module.scss", () => ({}));
jest.mock("@/components/ui/Button.module.scss", () => ({}));

describe("EmptyState component", () => {
  it("should render the title", () => {
    render(<EmptyState title="No products" message="Try different filters." />);
    expect(screen.getByText("No products")).toBeInTheDocument();
  });

  it("should render the message", () => {
    render(<EmptyState title="No results" message="Nothing was found." />);
    expect(screen.getByText("Nothing was found.")).toBeInTheDocument();
  });

  it("should render an action link when actionHref and actionLabel are provided", () => {
    render(
      <EmptyState
        title="Empty"
        message="Nothing here."
        actionHref="/products"
        actionLabel="Browse products"
      />
    );
    expect(screen.getByRole("link", { name: "Browse products" })).toBeInTheDocument();
  });

  it("should NOT render an action link when actionHref is omitted", () => {
    render(<EmptyState title="Empty" message="Nothing here." actionLabel="Browse" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should NOT render an action link when actionLabel is omitted", () => {
    render(<EmptyState title="Empty" message="Nothing here." actionHref="/products" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
