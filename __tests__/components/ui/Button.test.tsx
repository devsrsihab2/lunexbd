/**
 * Button.test.tsx
 *
 * Tests the Button component:
 * - Renders a standard button or Link based on href
 * - Applies loading state and disables action triggers
 * - Passes attributes down to native button or anchor element
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

jest.mock("@/components/ui/Button.module.scss", () => ({
  button: "btn",
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  full: "btn-full",
}));

describe("Button component", () => {
  it("renders a standard button when href is not provided", () => {
    render(<Button type="submit">Submit Now</Button>);
    const btn = screen.getByRole("button", { name: "Submit Now" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("type", "submit");
  });

  it("renders a Link anchor element when href is provided", () => {
    render(<Button href="/shop">Shop Bags</Button>);
    const link = screen.getByRole("link", { name: "Shop Bags" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/shop");
  });

  it("handles loading states correctly on button element", () => {
    const clickHandler = jest.fn();
    render(<Button loading onClick={clickHandler}>Click Me</Button>);
    
    // Shows loading text instead of children
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Click Me")).not.toBeInTheDocument();

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();

    fireEvent.click(btn);
    expect(clickHandler).not.toHaveBeenCalled();
  });

  it("handles loading/disabled states correctly on Link anchor element", () => {
    render(<Button href="/shop" loading>Link Me</Button>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  it("applies fullWidth and variant style classes", () => {
    const { rerender } = render(<Button variant="secondary" fullWidth>Click</Button>);
    let btn = screen.getByRole("button");
    expect(btn).toHaveClass("btn btn-secondary btn-full");

    rerender(<Button variant="ghost">Click</Button>);
    btn = screen.getByRole("button");
    expect(btn).toHaveClass("btn btn-ghost");
  });
});
