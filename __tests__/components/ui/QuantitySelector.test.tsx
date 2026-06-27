/**
 * QuantitySelector.test.tsx
 *
 * Tests the QuantitySelector component:
 * - Renders the current value in an <output> element
 * - Calls onChange with value + 1 when "+" is clicked
 * - Calls onChange with value - 1 when "-" is clicked (respecting min)
 * - Clamps to min when decrement would go below it
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuantitySelector } from "@/components/ui/QuantitySelector";

// Mock CSS modules
jest.mock("@/components/ui/Button.module.scss", () => ({}));

describe("QuantitySelector component", () => {
  it("should display the current quantity value", () => {
    render(<QuantitySelector value={3} onChange={jest.fn()} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should call onChange with incremented value when '+' is clicked", () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={2} onChange={onChange} />);
    fireEvent.click(screen.getByText("+"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("should call onChange with decremented value when '-' is clicked", () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} />);
    fireEvent.click(screen.getByText("-"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("should clamp to min when decrement would go below it", () => {
    const onChange = jest.fn();
    // value is already at min=1
    render(<QuantitySelector value={1} min={1} onChange={onChange} />);
    fireEvent.click(screen.getByText("-"));
    expect(onChange).toHaveBeenCalledWith(1); // clamped at min
  });

  it("should use custom min value", () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={3} min={3} onChange={onChange} />);
    fireEvent.click(screen.getByText("-"));
    expect(onChange).toHaveBeenCalledWith(3); // clamped at custom min
  });

  it("should have an aria-label for accessibility", () => {
    render(<QuantitySelector value={1} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Quantity selector")).toBeInTheDocument();
  });
});
